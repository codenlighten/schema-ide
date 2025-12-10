#!/usr/bin/env node

/**
 * Schema.ICU CLI Tool - Phase 2
 * 
 * Commands:
 * - pipeline list
 * - pipeline run <name>
 * - pipeline create
 * - pipeline validate <file>
 * - new (project wizard)
 */

const { Command } = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer');
const ora = require('ora');
const fs = require('fs');
const path = require('path');

const program = new Command();

// Import our engine
const { SchemaICU } = require('@smartledger/schema-icu-sdk');
const { 
  PipelineEngine, 
  PolicyEngine,
  implementFeature,
  fixTests,
  newService
} = require('./index');

// Version and description
program
  .name('schema-icu')
  .description('Schema.ICU AI Pipeline Engine - Orchestrate AI agents from the command line')
  .version('1.0.0-beta.1');

// ===== PIPELINE LIST =====
program
  .command('pipeline-list')
  .alias('pl')
  .description('List all available pipelines')
  .action(() => {
    console.log(chalk.bold.cyan('\n📋 Available Pipelines:\n'));
    
    const pipelines = [
      {
        name: 'implement-feature',
        steps: 6,
        description: 'Complete feature implementation with planning, schema, code, and diffs'
      },
      {
        name: 'fix-tests',
        steps: 5,
        description: 'Analyze failing tests and generate fixes'
      },
      {
        name: 'new-service',
        steps: 7,
        description: 'Scaffold a complete microservice with boilerplate'
      }
    ];
    
    pipelines.forEach(p => {
      console.log(chalk.yellow(`  ${p.name}`) + chalk.gray(` (${p.steps} steps)`));
      console.log(chalk.gray(`    ${p.description}\n`));
    });
    
    console.log(chalk.gray('Run a pipeline with:'), chalk.cyan('schema-icu pipeline-run <name>\n'));
  });

// ===== PIPELINE RUN =====
program
  .command('pipeline-run')
  .alias('pr')
  .description('Run a pipeline interactively')
  .argument('[name]', 'Pipeline name (implement-feature, fix-tests, new-service)')
  .option('-p, --prompt <text>', 'User prompt/request')
  .option('-c, --context <file>', 'Context file (JSON)')
  .option('-o, --output <dir>', 'Output directory for results')
  .option('--no-policy', 'Disable policy engine (dangerous!)')
  .action(async (name, options) => {
    try {
      // Interactive pipeline selection if not provided
      if (!name) {
        const answer = await inquirer.prompt([
          {
            type: 'list',
            name: 'pipeline',
            message: 'Select a pipeline to run:',
            choices: [
              { name: '🎯 Implement Feature - Full feature development', value: 'implement-feature' },
              { name: '🔧 Fix Tests - Debug and fix failing tests', value: 'fix-tests' },
              { name: '🏗️  New Service - Scaffold microservice', value: 'new-service' }
            ]
          }
        ]);
        name = answer.pipeline;
      }
      
      // Get prompt if not provided
      let userPrompt = options.prompt;
      if (!userPrompt) {
        const answer = await inquirer.prompt([
          {
            type: 'input',
            name: 'prompt',
            message: 'What would you like to build/fix?',
            validate: input => input.length > 10 || 'Please provide a detailed description (10+ chars)'
          }
        ]);
        userPrompt = answer.prompt;
      }
      
      // Load context if provided
      let context = {};
      if (options.context) {
        context = JSON.parse(fs.readFileSync(options.context, 'utf8'));
      }
      
      // Initialize Schema.ICU client
      const spinner = ora('Initializing Schema.ICU client...').start();
      
      if (!process.env.SCHEMA_ICU_API_KEY) {
        spinner.fail(chalk.red('Missing SCHEMA_ICU_API_KEY environment variable'));
        console.log(chalk.yellow('\nSet your API key:'));
        console.log(chalk.gray('  export SCHEMA_ICU_API_KEY="your-key-here"'));
        console.log(chalk.gray('  export SCHEMA_ICU_EMAIL="your-email"\n'));
        process.exit(1);
      }
      
      const client = new SchemaICU();
      spinner.succeed('Schema.ICU client initialized');
      
      // Initialize PipelineEngine
      spinner.text = 'Setting up pipeline engine...';
      spinner.start();
      
      const engine = new PipelineEngine(client, {
        policyEngine: options.policy !== false ? new PolicyEngine({
          requireApproval: false // CLI runs non-interactively
        }) : null,
        verbose: true
      });
      
      // Register pipelines
      engine.registerPipeline(implementFeature);
      engine.registerPipeline(fixTests);
      engine.registerPipeline(newService);
      
      spinner.succeed('Pipeline engine ready');
      
      // Run the pipeline
      console.log(chalk.bold.cyan(`\n🚀 Running pipeline: ${name}\n`));
      
      const result = await engine.runPipeline(name, {
        userPrompt,
        ...context
      });
      
      // Display results
      console.log(chalk.bold.green('\n✅ Pipeline completed successfully!\n'));
      
      result.steps.forEach((step, i) => {
        console.log(chalk.cyan(`Step ${i + 1}: ${step.name}`));
        console.log(chalk.gray(`  Status: ${step.status}`));
        console.log(chalk.gray(`  Duration: ${step.duration}ms`));
        
        if (step.data && Object.keys(step.data).length > 0) {
          console.log(chalk.gray(`  Output keys: ${Object.keys(step.data).join(', ')}`));
        }
        console.log();
      });
      
      // Save output if requested
      if (options.output) {
        const outputPath = path.resolve(options.output);
        if (!fs.existsSync(outputPath)) {
          fs.mkdirSync(outputPath, { recursive: true });
        }
        
        const outputFile = path.join(outputPath, `${name}-${Date.now()}.json`);
        fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
        console.log(chalk.green(`💾 Results saved to: ${outputFile}\n`));
      }
      
      // Summary
      console.log(chalk.bold('📊 Summary:'));
      console.log(chalk.gray(`  Pipeline: ${result.pipelineName}`));
      console.log(chalk.gray(`  Status: ${result.status}`));
      console.log(chalk.gray(`  Total Steps: ${result.totalSteps}`));
      console.log(chalk.gray(`  Completed: ${result.completedSteps}`));
      console.log(chalk.gray(`  Total Duration: ${result.totalDuration}ms`));
      console.log();
      
    } catch (error) {
      console.error(chalk.red('\n❌ Error running pipeline:'));
      console.error(chalk.red(error.message));
      console.error(chalk.gray(error.stack));
      process.exit(1);
    }
  });

// ===== PIPELINE CREATE =====
program
  .command('pipeline-create')
  .alias('pc')
  .description('Create a custom pipeline interactively')
  .action(async () => {
    console.log(chalk.bold.cyan('\n🎨 Pipeline Creator\n'));
    
    // Basic info
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Pipeline name (kebab-case):',
        validate: input => /^[a-z0-9-]+$/.test(input) || 'Use lowercase letters, numbers, and hyphens only'
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description:',
        validate: input => input.length > 10 || 'Please provide a description (10+ chars)'
      },
      {
        type: 'checkbox',
        name: 'steps',
        message: 'Select steps to include:',
        choices: [
          { name: '💬 Improve Prompt - Refine user input', value: 'prompt' },
          { name: '📋 Plan Tasks - Break down into steps', value: 'plan' },
          { name: '📊 Generate Schema - Create JSON schemas', value: 'schema' },
          { name: '💻 Generate Code - Write implementation', value: 'code' },
          { name: '✨ Improve Code - Polish & optimize', value: 'improve' },
          { name: '🔧 Generate Diff - Create git diffs', value: 'diff' },
          { name: '🧪 Generate Tests - Create test cases', value: 'tests' },
          { name: '⚙️  Generate Terminal Commands - Setup commands', value: 'terminal' }
        ]
      }
    ]);
    
    // Generate pipeline definition
    const pipeline = {
      name: answers.name,
      description: answers.description,
      steps: answers.steps.map((step, i) => {
        const stepMap = {
          prompt: { agent: 'promptImprover', method: 'improve', name: 'Improve Prompt' },
          plan: { agent: 'projectPlanner', method: 'plan', name: 'Plan Tasks' },
          schema: { agent: 'schemaGenerator', method: 'generate', name: 'Generate Schema' },
          code: { agent: 'codeGenerator', method: 'generate', name: 'Generate Code' },
          improve: { agent: 'codeImprover', method: 'improve', name: 'Improve Code' },
          diff: { agent: 'diffImprover', method: 'generateDiff', name: 'Generate Diff' },
          tests: { agent: 'codeGenerator', method: 'generateTests', name: 'Generate Tests' },
          terminal: { agent: 'terminalAgent', method: 'generate', name: 'Generate Commands' }
        };
        
        return {
          step: i + 1,
          ...stepMap[step],
          inputFrom: i === 0 ? 'userPrompt' : `step${i}`
        };
      })
    };
    
    // Save pipeline
    const filename = `pipeline-${answers.name}.js`;
    const pipelineCode = `// Auto-generated pipeline: ${answers.name}
// Created: ${new Date().toISOString()}

module.exports = ${JSON.stringify(pipeline, null, 2)};
`;
    
    fs.writeFileSync(filename, pipelineCode);
    
    console.log(chalk.green(`\n✅ Pipeline created: ${filename}\n`));
    console.log(chalk.gray('To use this pipeline:'));
    console.log(chalk.cyan(`  const myPipeline = require('./${filename}');`));
    console.log(chalk.cyan(`  engine.registerPipeline(myPipeline);`));
    console.log(chalk.cyan(`  engine.runPipeline('${answers.name}', { userPrompt: '...' });\n`));
  });

// ===== PIPELINE VALIDATE =====
program
  .command('pipeline-validate')
  .alias('pv')
  .description('Validate a pipeline definition file')
  .argument('<file>', 'Pipeline file to validate')
  .action((file) => {
    const spinner = ora('Validating pipeline...').start();
    
    try {
      // Load and validate
      const pipeline = require(path.resolve(file));
      
      // Check required fields
      const required = ['name', 'description', 'steps'];
      const missing = required.filter(f => !pipeline[f]);
      
      if (missing.length > 0) {
        spinner.fail(chalk.red(`Missing required fields: ${missing.join(', ')}`));
        process.exit(1);
      }
      
      // Validate steps
      if (!Array.isArray(pipeline.steps) || pipeline.steps.length === 0) {
        spinner.fail(chalk.red('Pipeline must have at least one step'));
        process.exit(1);
      }
      
      pipeline.steps.forEach((step, i) => {
        if (!step.agent || !step.method) {
          throw new Error(`Step ${i + 1} missing agent or method`);
        }
      });
      
      spinner.succeed(chalk.green('Pipeline is valid!'));
      
      // Display info
      console.log(chalk.bold('\n📊 Pipeline Info:\n'));
      console.log(chalk.cyan(`  Name: ${pipeline.name}`));
      console.log(chalk.gray(`  Description: ${pipeline.description}`));
      console.log(chalk.gray(`  Steps: ${pipeline.steps.length}\n`));
      
      pipeline.steps.forEach((step, i) => {
        console.log(chalk.yellow(`  ${i + 1}. ${step.name || step.agent}`));
        console.log(chalk.gray(`     Agent: ${step.agent}, Method: ${step.method}`));
      });
      console.log();
      
    } catch (error) {
      spinner.fail(chalk.red('Validation failed'));
      console.error(chalk.red(`Error: ${error.message}\n`));
      process.exit(1);
    }
  });

// ===== NEW PROJECT =====
program
  .command('new')
  .description('Create a new project with Schema.ICU')
  .action(async () => {
    console.log(chalk.bold.cyan('\n🎯 Schema.ICU Project Generator\n'));
    
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name:',
        validate: input => input.length > 0 || 'Project name required'
      },
      {
        type: 'list',
        name: 'type',
        message: 'Project type:',
        choices: [
          'Express REST API',
          'React Frontend',
          'Next.js Full-Stack',
          'Node.js CLI Tool',
          'Microservice (Fastify)',
          'GraphQL Server',
          'Custom'
        ]
      },
      {
        type: 'input',
        name: 'description',
        message: 'Project description:'
      }
    ]);
    
    const spinner = ora('Generating project...').start();
    spinner.text = 'This will use the new-service pipeline...';
    
    // TODO: Actually integrate with new-service pipeline
    spinner.info(chalk.yellow('🚧 Full project generation coming soon!'));
    spinner.text = 'For now, creating basic structure...';
    
    // Create basic structure
    const projectPath = path.resolve(answers.projectName);
    fs.mkdirSync(projectPath, { recursive: true });
    fs.mkdirSync(path.join(projectPath, 'src'));
    
    // Create package.json
    const packageJson = {
      name: answers.projectName,
      version: '1.0.0',
      description: answers.description,
      main: 'src/index.js',
      scripts: {
        start: 'node src/index.js',
        dev: 'nodemon src/index.js'
      }
    };
    
    fs.writeFileSync(
      path.join(projectPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    
    // Create README
    fs.writeFileSync(
      path.join(projectPath, 'README.md'),
      `# ${answers.projectName}\n\n${answers.description}\n\nGenerated by Schema.ICU Pipeline Engine\n`
    );
    
    spinner.succeed(chalk.green(`Project created: ${projectPath}`));
    
    console.log(chalk.bold('\n📦 Next steps:\n'));
    console.log(chalk.cyan(`  cd ${answers.projectName}`));
    console.log(chalk.cyan(`  npm install`));
    console.log(chalk.cyan(`  npm start\n`));
  });

// Parse and execute
program.parse(process.argv);

// Show help if no command
if (program.args.length === 0) {
  program.help();
}
