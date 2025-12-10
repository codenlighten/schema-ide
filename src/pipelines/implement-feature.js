/**
 * Implement Feature Pipeline
 * 
 * Takes a feature description and generates complete, production-ready code
 * by coordinating multiple Schema.ICU agents.
 * 
 * Flow:
 * 1. Improve the user's prompt for clarity
 * 2. Break down into project tasks
 * 3. Generate API schema/contracts
 * 4. Generate implementation code
 * 5. Improve code with error handling
 * 6. Generate diff for review
 */

const implementFeature = {
  id: 'implement-feature',
  version: '1.0.0',
  name: 'Implement Feature',
  description: 'Takes a feature description and generates complete implementation with schema, code, and improvements',
  author: 'Schema.ICU',
  tags: ['code-generation', 'feature', 'full-stack'],
  
  steps: [
    {
      id: 'improve-prompt',
      name: 'Improve Feature Description',
      description: 'Clarify and enhance the user prompt for better results',
      agent: 'promptImprover',
      method: 'improve',
      inputFrom: 'user',
      continueOnError: false
    },
    
    {
      id: 'plan-tasks',
      name: 'Break Down Into Tasks',
      description: 'Create a project plan with time estimates',
      agent: 'projectPlanner',
      method: 'plan',
      inputFrom: 'previousStep',
      contextBuilder: (results, context) => ({
        technology: context.preferences?.framework || 'Node.js',
        experience: context.preferences?.experience || 'intermediate'
      }),
      resultTransform: (data) => data,
      continueOnError: false
    },
    
    {
      id: 'generate-schema',
      name: 'Generate API Schema',
      description: 'Define data structures and interfaces',
      agent: 'schemaGenerator',
      method: 'generate',
      inputFrom: 'context',
      query: 'Based on the project plan, generate JSON schemas for the main data models',
      contextBuilder: (results) => ({
        projectPlan: results.find(r => r.stepId === 'plan-tasks')?.data
      }),
      continueOnError: true // Schema is helpful but not required
    },
    
    {
      id: 'generate-code',
      name: 'Generate Implementation',
      description: 'Create the feature code',
      agent: 'codeGenerator',
      method: 'generate',
      inputFrom: 'previousStep',
      contextBuilder: (results, context) => ({
        language: context.preferences?.language || 'JavaScript',
        schema: results.find(r => r.stepId === 'generate-schema')?.data?.schemaAsString,
        projectPlan: results.find(r => r.stepId === 'plan-tasks')?.data
      }),
      continueOnError: false
    },
    
    {
      id: 'improve-code',
      name: 'Add Error Handling & Polish',
      description: 'Enhance generated code with production-ready patterns',
      agent: 'codeImprover',
      method: 'improve',
      inputFrom: 'previousStep',
      query: 'Add comprehensive error handling, input validation, and improve code quality',
      contextBuilder: (results, context) => ({
        code: results.find(r => r.stepId === 'generate-code')?.data?.code,
        language: context.preferences?.language || 'JavaScript',
        focusAreas: ['error-handling', 'validation', 'readability', 'performance']
      }),
      continueOnError: true
    },
    
    {
      id: 'generate-diff',
      name: 'Create Review Diff',
      description: 'Generate a diff showing all improvements',
      agent: 'diffImprover',
      method: 'improve',
      inputFrom: 'previousStep',
      contextBuilder: (results, context) => {
        const originalCode = results.find(r => r.stepId === 'generate-code')?.data?.code;
        const improvedCode = results.find(r => r.stepId === 'improve-code')?.data?.improvedCode;
        
        return {
          language: context.preferences?.language || 'JavaScript',
          focusAreas: ['error-handling', 'validation']
        };
      },
      continueOnError: true
    }
  ],
  
  defaultContext: {
    preferences: {
      language: 'JavaScript',
      framework: 'Node.js',
      experience: 'intermediate'
    }
  }
};

module.exports = implementFeature;
