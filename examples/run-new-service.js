#!/usr/bin/env node

/**
 * Run New Service Pipeline
 * 
 * Scaffolds a complete microservice/module
 */

const { SchemaICU } = require('@smartledger/schema-icu-sdk');
const { PipelineEngine, PolicyEngine, newService } = require('../src');

async function main() {
  console.log('🏗️  New Service Pipeline\n');

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

  engine.registerPipeline(newService);

  console.log('This pipeline will:');
  console.log('  1. Design service architecture (Box Designer)');
  console.log('  2. Create implementation plan');
  console.log('  3. Generate API schemas');
  console.log('  4. Generate service code');
  console.log('  5. Generate test suite');
  console.log('  6. Generate setup commands');
  console.log('  7. Generate GitHub workflow\n');

  console.log('🚀 Running new-service pipeline...\n');

  const result = await engine.runPipeline('new-service', {
    userPrompt: 'Design a user authentication service with JWT tokens, password hashing, and rate limiting',
    preferences: {
      language: 'JavaScript',
      framework: 'Node.js with Express',
      experience: 'intermediate'
    },
    environment: {
      os: 'linux',
      shell: 'bash'
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
    
    if (step.stepId === 'design-architecture' && step.data) {
      console.log(`   Service: ${step.data.name}`);
      console.log(`   Inputs: ${step.data.inputs?.length || 0}`);
      console.log(`   Outputs: ${step.data.outputs?.length || 0}`);
    }
    
    if (step.stepId === 'create-plan' && step.data) {
      console.log(`   Tasks: ${step.data.tasks?.length || 0}`);
      const totalTime = step.data.tasks?.reduce((sum, t) => sum + (t.estimatedTimeHours || 0), 0);
      console.log(`   Estimated time: ${totalTime} hours`);
    }
  });

  // Show generated code
  const codeStep = result.steps.find(s => s.stepId === 'generate-service-code');
  if (codeStep && codeStep.data && codeStep.data.code) {
    console.log('\n' + '='.repeat(60));
    console.log('📝 GENERATED SERVICE CODE (Preview)');
    console.log('='.repeat(60));
    console.log(codeStep.data.code.substring(0, 800) + '...\n');
  }

  // Show setup commands
  const setupStep = result.steps.find(s => s.stepId === 'setup-commands');
  if (setupStep && setupStep.data) {
    console.log('='.repeat(60));
    console.log('⚙️  SETUP COMMANDS');
    console.log('='.repeat(60));
    console.log(setupStep.data.code || setupStep.data.command);
  }

  console.log('\n✨ Service scaffold complete!\n');
}

main().catch(error => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
