/**
 * New Service Pipeline
 * 
 * Scaffolds a complete microservice/module from scratch.
 * 
 * Flow:
 * 1. Design the service architecture (Box Designer)
 * 2. Generate project plan
 * 3. Create API schemas
 * 4. Generate main service code
 * 5. Generate setup commands
 * 6. Generate GitHub workflow
 */

const newService = {
  id: 'new-service',
  version: '1.0.0',
  name: 'New Service/Module',
  description: 'Scaffolds a complete microservice or module with architecture, code, and setup',
  author: 'Schema.ICU',
  tags: ['scaffolding', 'microservice', 'architecture'],
  
  steps: [
    {
      id: 'design-architecture',
      name: 'Design Service Architecture',
      description: 'Use Box Designer to create modular component design',
      agent: 'boxDesigner',
      method: 'design',
      inputFrom: 'user',
      continueOnError: false
    },
    
    {
      id: 'create-plan',
      name: 'Create Implementation Plan',
      description: 'Break down service into implementation tasks',
      agent: 'projectPlanner',
      method: 'plan',
      inputFrom: 'previousStep',
      contextBuilder: (results, context) => {
        const design = results.find(r => r.stepId === 'design-architecture')?.data;
        return {
          technology: context.preferences?.framework || 'Node.js with Express',
          experience: context.preferences?.experience || 'intermediate',
          serviceDesign: design
        };
      },
      continueOnError: false
    },
    
    {
      id: 'generate-schemas',
      name: 'Generate API Schemas',
      description: 'Create schemas for all inputs/outputs',
      agent: 'schemaGenerator',
      method: 'generate',
      inputFrom: 'context',
      query: 'Generate JSON schemas for all API endpoints based on the service design',
      contextBuilder: (results) => {
        const design = results.find(r => r.stepId === 'design-architecture')?.data;
        return {
          inputs: design?.inputs,
          outputs: design?.outputs,
          serviceName: design?.name
        };
      },
      continueOnError: false
    },
    
    {
      id: 'generate-service-code',
      name: 'Generate Service Code',
      description: 'Create the main service implementation',
      agent: 'codeGenerator',
      method: 'generate',
      inputFrom: 'context',
      query: 'Generate complete service code with routes, controllers, and business logic',
      contextBuilder: (results, context) => {
        const design = results.find(r => r.stepId === 'design-architecture')?.data;
        const schema = results.find(r => r.stepId === 'generate-schemas')?.data;
        const plan = results.find(r => r.stepId === 'create-plan')?.data;
        
        return {
          language: context.preferences?.language || 'JavaScript',
          serviceDesign: design,
          schemas: schema?.schemaAsString,
          projectPlan: plan
        };
      },
      continueOnError: false
    },
    
    {
      id: 'generate-tests',
      name: 'Generate Test Suite',
      description: 'Create unit and integration tests',
      agent: 'codeGenerator',
      method: 'generate',
      inputFrom: 'context',
      query: 'Generate comprehensive unit and integration tests for this service',
      contextBuilder: (results, context) => {
        const serviceCode = results.find(r => r.stepId === 'generate-service-code')?.data;
        
        return {
          language: context.preferences?.language || 'JavaScript',
          codeToTest: serviceCode?.code,
          testFramework: 'Jest'
        };
      },
      continueOnError: true
    },
    
    {
      id: 'setup-commands',
      name: 'Generate Setup Commands',
      description: 'Commands to initialize and run the service',
      agent: 'terminalAgent',
      method: 'generate',
      inputFrom: 'context',
      query: 'Generate commands to initialize project, install dependencies, and run the service',
      contextBuilder: (results, context) => ({
        os: context.environment?.os || 'linux',
        shell: context.environment?.shell || 'bash',
        framework: context.preferences?.framework || 'Node.js'
      }),
      continueOnError: true
    },
    
    {
      id: 'github-workflow',
      name: 'Generate GitHub Workflow',
      description: 'CI/CD setup with GitHub Actions',
      agent: 'githubAgent',
      method: 'generate',
      inputFrom: 'context',
      query: 'Create GitHub workflow for CI/CD: install deps, run tests, and deploy',
      contextBuilder: (results, context) => {
        const plan = results.find(r => r.stepId === 'create-plan')?.data;
        
        return {
          projectName: plan?.projectName,
          framework: context.preferences?.framework
        };
      },
      continueOnError: true
    }
  ],
  
  defaultContext: {
    environment: {
      os: 'linux',
      shell: 'bash'
    },
    preferences: {
      language: 'JavaScript',
      framework: 'Node.js with Express',
      experience: 'intermediate'
    }
  }
};

module.exports = newService;
