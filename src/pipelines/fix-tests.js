/**
 * Fix Tests Pipeline
 * 
 * Analyzes failing tests and generates fixes for the code.
 * 
 * Flow:
 * 1. Generate command to run tests
 * 2. Analyze test failures
 * 3. Improve code to fix failures
 * 4. Generate diff with fixes
 * 5. Generate re-run command
 */

const fixTests = {
  id: 'fix-tests',
  version: '1.0.0',
  name: 'Fix Failing Tests',
  description: 'Analyzes test failures and generates code fixes to make tests pass',
  author: 'Schema.ICU',
  tags: ['testing', 'debugging', 'fixes'],
  
  steps: [
    {
      id: 'generate-test-command',
      name: 'Generate Test Command',
      description: 'Create the command to run tests',
      agent: 'terminalAgent',
      method: 'generate',
      inputFrom: 'context',
      query: 'Generate command to run all tests',
      contextBuilder: (results, context) => ({
        os: context.environment?.os || 'linux',
        shell: context.environment?.shell || 'bash'
      }),
      continueOnError: false
    },
    
    {
      id: 'analyze-failures',
      name: 'Analyze Test Failures',
      description: 'Understand what tests are failing and why',
      agent: 'base',
      method: 'query',
      inputFrom: 'tests',
      query: 'Analyze these test failures and identify the root causes. Be specific about what needs to be fixed.',
      continueOnError: false
    },
    
    {
      id: 'generate-fixes',
      name: 'Generate Code Fixes',
      description: 'Create code that fixes the failing tests',
      agent: 'codeImprover',
      method: 'improve',
      inputFrom: 'previousStep',
      query: 'Fix the code to make the failing tests pass',
      contextBuilder: (results, context) => ({
        code: context.failingCode || '',
        language: context.preferences?.language || 'JavaScript',
        focusAreas: ['correctness', 'test-compatibility']
      }),
      continueOnError: false
    },
    
    {
      id: 'create-diff',
      name: 'Create Fix Diff',
      description: 'Generate diff showing the fixes',
      agent: 'diffImprover',
      method: 'improve',
      inputFrom: 'previousStep',
      contextBuilder: (results, context) => ({
        language: context.preferences?.language || 'JavaScript',
        focusAreas: ['correctness']
      }),
      continueOnError: true
    },
    
    {
      id: 'retest-command',
      name: 'Generate Retest Command',
      description: 'Command to verify fixes',
      agent: 'terminalAgent',
      method: 'generate',
      inputFrom: 'context',
      query: 'Generate command to re-run the failing tests',
      contextBuilder: (results, context) => ({
        os: context.environment?.os || 'linux',
        shell: context.environment?.shell || 'bash'
      }),
      continueOnError: true
    }
  ],
  
  defaultContext: {
    environment: {
      os: 'linux',
      shell: 'bash'
    },
    preferences: {
      language: 'JavaScript'
    }
  }
};

module.exports = fixTests;
