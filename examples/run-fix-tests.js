#!/usr/bin/env node

/**
 * Run Fix Tests Pipeline
 * 
 * Analyzes test failures and generates fixes
 */

const { SchemaICU } = require('@smartledger/schema-icu-sdk');
const { PipelineEngine, PolicyEngine, fixTests } = require('../src');

async function main() {
  console.log('🔧 Fix Tests Pipeline\n');

  const client = new SchemaICU();
  if (!client.isAuthenticated()) {
    console.error('❌ Not authenticated');
    process.exit(1);
  }

  const engine = new PipelineEngine(client, {
    verbose: true,
    policyEngine: new PolicyEngine(),
    autoApprove: true
  });

  engine.registerPipeline(fixTests);

  // Mock test failure data
  const mockTestResults = {
    failed: 3,
    passed: 12,
    failures: [
      {
        test: 'should validate email format',
        error: 'Expected validation to reject invalid email, but it passed',
        file: 'tests/validation.test.js',
        line: 45
      },
      {
        test: 'should handle null input',
        error: 'TypeError: Cannot read property "length" of null',
        file: 'tests/validation.test.js',
        line: 67
      },
      {
        test: 'should sanitize HTML',
        error: 'Expected "<script>" to be removed, got "<script>"',
        file: 'tests/sanitize.test.js',
        line: 23
      }
    ]
  };

  const mockCode = `
function validateEmail(email) {
  return email.includes('@');
}

function sanitizeHtml(html) {
  return html;
}

function processInput(input) {
  return input.length > 0;
}
  `;

  console.log('Mock test failures:');
  mockTestResults.failures.forEach((f, i) => {
    console.log(`  ${i + 1}. ${f.test}`);
    console.log(`     ${f.error}`);
  });

  console.log('\n🚀 Running fix-tests pipeline...\n');

  const result = await engine.runPipeline('fix-tests', {
    testResults: mockTestResults,
    failingCode: mockCode,
    preferences: {
      language: 'JavaScript'
    },
    environment: {
      os: 'linux',
      shell: 'bash'
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESULTS');
  console.log('='.repeat(60));

  console.log(`\nSuccess: ${result.success ? '✅' : '❌'}`);
  console.log(`Duration: ${result.totalDuration}ms`);

  result.steps.forEach((step, i) => {
    console.log(`\n${i + 1}. ${step.stepName}: ${step.success ? '✅' : '❌'}`);
  });

  const fixStep = result.steps.find(s => s.stepId === 'generate-fixes');
  if (fixStep && fixStep.data) {
    console.log('\n' + '='.repeat(60));
    console.log('🔨 PROPOSED FIXES');
    console.log('='.repeat(60));
    console.log(fixStep.data.improvedCode || fixStep.data.code);
  }

  console.log('\n✨ Done!\n');
}

main().catch(error => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
