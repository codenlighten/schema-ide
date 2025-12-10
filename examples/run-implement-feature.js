#!/usr/bin/env node

/**
 * Run Implement Feature Pipeline
 * 
 * Interactive script to use the implement-feature pipeline
 */

const { SchemaICU } = require('@smartledger/schema-icu-sdk');
const { PipelineEngine, PolicyEngine, implementFeature } = require('../src');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function main() {
  console.log('🎯 Implement Feature Pipeline\n');

  const client = new SchemaICU();
  if (!client.isAuthenticated()) {
    console.error('❌ Not authenticated. Please run: npx schema-icu setup');
    process.exit(1);
  }

  const policyEngine = new PolicyEngine();
  const engine = new PipelineEngine(client, {
    verbose: true,
    policyEngine,
    autoApprove: false, // Interactive mode
    onApprovalRequired: async (request) => {
      console.log(`\n⚠️  Approval Required:`);
      console.log(`   Type: ${request.type}`);
      console.log(`   ${request.step || request.pipeline}`);
      if (request.query) {
        console.log(`   Query: ${request.query.substring(0, 100)}...`);
      }
      
      const answer = await ask('   Approve? (y/n): ');
      return answer.toLowerCase() === 'y';
    },
    onStepComplete: async (result, current, total) => {
      console.log(`\n✅ Step ${current}/${total} complete: ${result.stepName}`);
      if (result.data.reasoning) {
        console.log(`   Reasoning: ${result.data.reasoning.substring(0, 150)}...`);
      }
    }
  });

  engine.registerPipeline(implementFeature);

  // Get user input
  console.log('This pipeline will:');
  console.log('  1. Improve your feature description');
  console.log('  2. Create a project plan');
  console.log('  3. Generate API schemas');
  console.log('  4. Generate implementation code');
  console.log('  5. Add error handling & polish');
  console.log('  6. Create review diff\n');

  const feature = await ask('Describe the feature you want to implement: ');
  if (!feature.trim()) {
    console.log('❌ Feature description required');
    process.exit(1);
  }

  const language = await ask('Programming language (default: JavaScript): ') || 'JavaScript';
  const framework = await ask('Framework (default: Node.js): ') || 'Node.js';

  rl.close();

  console.log('\n🚀 Starting pipeline...\n');

  const result = await engine.runPipeline('implement-feature', {
    userPrompt: feature,
    preferences: {
      language,
      framework,
      experience: 'intermediate'
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log('📊 PIPELINE RESULTS');
  console.log('='.repeat(60));

  console.log(`\nSuccess: ${result.success ? '✅' : '❌'}`);
  console.log(`Duration: ${result.totalDuration}ms`);
  console.log(`Steps: ${result.steps.filter(s => s.success).length}/${result.steps.length} succeeded`);

  result.steps.forEach((step, i) => {
    console.log(`\n${i + 1}. ${step.stepName}: ${step.success ? '✅' : '❌'}`);
    console.log(`   Duration: ${step.duration}ms`);
    if (step.signature) {
      console.log(`   🔐 Signed: ${step.signature.hash.substring(0, 16)}...`);
    }
  });

  // Show final code
  const codeStep = result.steps.find(s => s.stepId === 'improve-code' || s.stepId === 'generate-code');
  if (codeStep && codeStep.data) {
    console.log('\n' + '='.repeat(60));
    console.log('📝 GENERATED CODE');
    console.log('='.repeat(60));
    console.log(codeStep.data.improvedCode || codeStep.data.code);
  }

  console.log('\n✨ Done!\n');
}

main().catch(error => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
