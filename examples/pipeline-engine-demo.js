#!/usr/bin/env node

/**
 * Pipeline Engine Demo
 * 
 * Demonstrates the new PipelineEngine with all 3 built-in pipelines:
 * - implement-feature
 * - fix-tests
 * - new-service
 */

const { SchemaICU } = require('@smartledger/schema-icu-sdk');
const { PipelineEngine, PolicyEngine, pipelines } = require('../src');

async function main() {
  console.log('🎯 Schema.ICU Pipeline Engine Demo\n');
  console.log('='.repeat(60));

  // Initialize Schema.ICU client
  const client = new SchemaICU();

  if (!client.isAuthenticated()) {
    console.error('\n❌ Not authenticated. Please run: npx schema-icu setup');
    process.exit(1);
  }

  // Initialize PolicyEngine with default policies
  const policyEngine = new PolicyEngine();
  console.log('\n✅ PolicyEngine initialized with security rules');
  console.log(`   Rules loaded: ${policyEngine.getRules().length}`);

  // Initialize PipelineEngine
  const engine = new PipelineEngine(client, {
    verbose: true,
    policyEngine,
    autoApprove: true // For demo purposes
  });
  
  console.log('✅ PipelineEngine initialized\n');

  // Register all built-in pipelines
  pipelines.all.forEach(pipeline => {
    engine.registerPipeline(pipeline);
  });

  console.log('✅ Registered pipelines:');
  engine.listPipelines().forEach(p => {
    console.log(`   - ${p.id}: ${p.name} (${p.steps} steps)`);
  });

  // Demo 1: Implement Feature Pipeline
  console.log('\n' + '='.repeat(60));
  console.log('📝 DEMO 1: Implement Feature Pipeline');
  console.log('='.repeat(60));

  try {
    const result1 = await engine.runPipeline('implement-feature', {
      userPrompt: 'Create a rate limiting middleware function for Express.js',
      preferences: {
        language: 'JavaScript',
        framework: 'Express.js',
        experience: 'intermediate'
      },
      environment: {
        os: 'linux',
        shell: 'bash'
      }
    });

    console.log('\n📊 Pipeline Result:');
    console.log(`   Success: ${result1.success}`);
    console.log(`   Steps completed: ${result1.steps.filter(s => s.success).length}/${result1.steps.length}`);
    console.log(`   Total duration: ${result1.totalDuration}ms`);
    console.log(`   Actions collected: ${result1.actions.length}`);

    if (result1.success) {
      console.log('\n✨ Generated Code:');
      const codeStep = result1.steps.find(s => s.stepId === 'generate-code');
      if (codeStep && codeStep.data.code) {
        console.log(codeStep.data.code.substring(0, 500) + '...\n');
      }
    }

  } catch (error) {
    console.error('❌ Error in demo 1:', error.message);
  }

  // Demo 2: List all registered pipelines
  console.log('\n' + '='.repeat(60));
  console.log('📋 All Registered Pipelines');
  console.log('='.repeat(60));

  const allPipelines = engine.listPipelines();
  allPipelines.forEach(p => {
    console.log(`\n🔹 ${p.name} (v${p.version})`);
    console.log(`   ID: ${p.id}`);
    console.log(`   Description: ${p.description}`);
    console.log(`   Steps: ${p.steps}`);
  });

  // Demo 3: Show policy rules
  console.log('\n' + '='.repeat(60));
  console.log('🔒 Active Security Policies');
  console.log('='.repeat(60));

  const rules = policyEngine.getRules();
  rules.forEach(rule => {
    console.log(`\n🔸 ${rule.id}`);
    console.log(`   Applies to: ${rule.appliesTo}`);
    console.log(`   Effect: ${rule.effect}`);
    if (rule.conditions) {
      if (rule.conditions.deniedFiles) {
        console.log(`   Denied files: ${rule.conditions.deniedFiles.slice(0, 3).join(', ')}...`);
      }
      if (rule.conditions.deniedCommands) {
        console.log(`   Denied commands: ${rule.conditions.deniedCommands.slice(0, 3).join(', ')}...`);
      }
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log('✅ Demo completed successfully!\n');
  console.log('💡 Try the individual pipeline scripts:');
  console.log('   npm run engine:implement');
  console.log('   npm run engine:fix-tests');
  console.log('   npm run engine:new-service');
  console.log('');
}

// Run demo
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
