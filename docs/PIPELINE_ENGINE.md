### Pipeline Engine

**Schema.ICU IDE Platform - Phase 1**

---

## 🎯 **Overview**

The **PipelineEngine** is the core orchestration layer for Schema.ICU's AI IDE platform. It coordinates multiple specialized AI agents into structured, verifiable workflows called **pipelines**.

Unlike traditional AI coding assistants that operate on single interactions, the PipelineEngine enables complex, multi-step development workflows with:

- ✅ **Guaranteed structure** - Every response validated against JSON schemas
- 🔐 **Cryptographic signing** - BSV blockchain signatures on all agent outputs
- 🔒 **Policy enforcement** - Schema-based security rules prevent malicious actions
- 📊 **Full traceability** - Complete audit trail of all agent actions
- 🔄 **Composable workflows** - Chain agents in sophisticated patterns

---

## 🏗️ **Architecture**

```
┌─────────────────────────────────────────────────────┐
│                  Pipeline Engine                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  Pipeline Definition (JSON)                  │   │
│  │  • Steps (Agent + Method + Context)          │   │
│  │  • Input/Output Mappings                     │   │
│  │  • Policy Rules                              │   │
│  └─────────────────────────────────────────────┘   │
│                        ↓                             │
│  ┌─────────────────────────────────────────────┐   │
│  │  Step Executor                               │   │
│  │  • Context Building                          │   │
│  │  • Agent Invocation                          │   │
│  │  • Result Transformation                     │   │
│  └─────────────────────────────────────────────┘   │
│                        ↓                             │
│  ┌─────────────────────────────────────────────┐   │
│  │  Policy Engine                               │   │
│  │  • Schema Validation                         │   │
│  │  • File/Command Whitelisting                 │   │
│  │  • Approval Requirements                     │   │
│  └─────────────────────────────────────────────┘   │
│                        ↓                             │
│  ┌─────────────────────────────────────────────┐   │
│  │  11 Schema.ICU Agents                        │   │
│  │  base | codeGenerator | schemaGenerator      │   │
│  │  terminalAgent | codeImprover | diffImprover │   │
│  │  boxDesigner | projectPlanner | promptImprover │
│  │  toolChoice | githubAgent                    │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 **Quick Start**

### Installation

```javascript
const { SchemaICU } = require('@smartledger/schema-icu-sdk');
const { PipelineEngine, PolicyEngine, implementFeature } = require('./src');

// Initialize
const client = new SchemaICU();
const policyEngine = new PolicyEngine();
const engine = new PipelineEngine(client, { 
  verbose: true,
  policyEngine 
});

// Register built-in pipeline
engine.registerPipeline(implementFeature);

// Run it!
const result = await engine.runPipeline('implement-feature', {
  userPrompt: 'Create a rate limiting middleware for Express',
  preferences: {
    language: 'JavaScript',
    framework: 'Express.js'
  }
});

console.log(result.steps[3].data.code); // Generated code
```

### Run Examples

```bash
# Demo all features
npm run engine:demo

# Interactive feature implementation
npm run engine:implement

# Fix failing tests
npm run engine:fix-tests

# Scaffold new service
npm run engine:new-service
```

---

## 📚 **Core Concepts**

### Pipelines

A **pipeline** is a sequence of steps that coordinate multiple AI agents to accomplish a complex task.

```javascript
const pipeline = {
  id: 'my-pipeline',
  version: '1.0.0',
  name: 'My Custom Pipeline',
  description: 'What this pipeline does',
  steps: [/* step definitions */]
};
```

### Steps

Each **step** invokes one Schema.ICU agent with specific context:

```javascript
{
  id: 'generate-code',
  name: 'Generate Implementation',
  agent: 'codeGenerator',           // Which agent
  method: 'generate',                // Which method
  inputFrom: 'previousStep',         // Where to get input
  contextBuilder: (results, ctx) => ({
    language: ctx.preferences.language,
    schema: results[0].data.schemaAsString
  }),
  continueOnError: false
}
```

### Context

Context flows through the pipeline, accumulating results:

```javascript
{
  userPrompt: 'Create a user auth service',
  preferences: {
    language: 'JavaScript',
    framework: 'Express.js',
    experience: 'intermediate'
  },
  environment: {
    os: 'linux',
    shell: 'bash'
  },
  stepResults: {
    'step-1': { /* data from step 1 */ },
    'step-2': { /* data from step 2 */ }
  }
}
```

### Actions

Steps can emit **actions** - concrete changes to be applied:

```javascript
{
  type: 'APPLY_DIFF',
  targets: ['src/app.js'],
  payload: { diff: '...' },
  reasoning: 'Improve error handling',
  requiresApproval: true
}
```

Action types:
- `CREATE_FILE` - Create new file
- `MODIFY_FILE` - Edit existing file
- `APPLY_DIFF` - Apply unified diff
- `DELETE_FILE` - Remove file
- `RUN_COMMAND` - Execute shell command
- `CREATE_BRANCH` - Git branch
- `COMMIT_CHANGES` - Git commit

---

## 🔒 **Security: Policy Engine**

The PolicyEngine enforces schema-based security rules to prevent malicious actions.

### Default Policies

```javascript
const policyEngine = new PolicyEngine(); // Loads default rules

// Denies access to sensitive files
// ❌ .env, secrets/*, *.key, *.pem

// Denies dangerous commands
// ❌ rm -rf /, curl | bash, fork bombs

// Requires approval for:
// ⚠️  File deletions
// ⚠️  All terminal commands
```

### Custom Policies

```javascript
policyEngine.addRule({
  id: 'allow-only-src',
  appliesTo: 'action',
  target: ['CREATE_FILE', 'MODIFY_FILE'],
  effect: 'allow',
  conditions: {
    allowedFiles: ['src/**/*.js', 'tests/**/*.test.js']
  }
});
```

### Policy Configuration

```json
{
  "version": "1.0.0",
  "defaultEffect": "allow",
  "defaultRequiresApproval": true,
  "rules": [
    {
      "id": "deny-secrets",
      "appliesTo": "action",
      "target": ["MODIFY_FILE", "DELETE_FILE"],
      "effect": "deny",
      "conditions": {
        "deniedFiles": ["**/.env", "**/secrets/**"]
      }
    }
  ]
}
```

---

## 🛠️ **Built-in Pipelines**

### 1. Implement Feature

**ID:** `implement-feature`  
**Steps:** 6  
**Duration:** ~2-3 minutes

Takes a feature description and generates complete, production-ready code.

**Flow:**
1. Improve prompt clarity
2. Break down into tasks
3. Generate API schemas
4. Generate implementation
5. Add error handling
6. Create review diff

**Usage:**
```javascript
await engine.runPipeline('implement-feature', {
  userPrompt: 'Add two-factor authentication to login',
  preferences: { language: 'JavaScript', framework: 'Express.js' }
});
```

### 2. Fix Tests

**ID:** `fix-tests`  
**Steps:** 5  
**Duration:** ~1-2 minutes

Analyzes failing tests and generates code fixes.

**Flow:**
1. Generate test command
2. Analyze failures
3. Generate fixes
4. Create diff
5. Generate retest command

**Usage:**
```javascript
await engine.runPipeline('fix-tests', {
  testResults: { failures: [...] },
  failingCode: '...',
  preferences: { language: 'JavaScript' }
});
```

### 3. New Service

**ID:** `new-service`  
**Steps:** 7  
**Duration:** ~3-4 minutes

Scaffolds a complete microservice from scratch.

**Flow:**
1. Design architecture (Box Designer)
2. Create implementation plan
3. Generate schemas
4. Generate service code
5. Generate tests
6. Generate setup commands
7. Generate GitHub workflow

**Usage:**
```javascript
await engine.runPipeline('new-service', {
  userPrompt: 'User authentication service with JWT',
  preferences: { language: 'JavaScript', framework: 'Express.js' }
});
```

---

## 🎓 **Creating Custom Pipelines**

### Simple Example

```javascript
const myPipeline = {
  id: 'refactor-component',
  version: '1.0.0',
  name: 'Refactor Component',
  description: 'Improve a React component',
  
  steps: [
    {
      id: 'analyze',
      name: 'Analyze Current Code',
      agent: 'base',
      method: 'query',
      inputFrom: 'selection',
      query: 'Analyze this React component and identify improvements'
    },
    {
      id: 'improve',
      name: 'Apply Improvements',
      agent: 'codeImprover',
      method: 'improve',
      inputFrom: 'selection',
      contextBuilder: (results) => ({
        code: results[0].data.code,
        language: 'JavaScript',
        focusAreas: ['hooks', 'performance', 'accessibility']
      })
    },
    {
      id: 'diff',
      name: 'Generate Diff',
      agent: 'diffImprover',
      method: 'improve',
      inputFrom: 'previousStep',
      contextBuilder: () => ({ language: 'JavaScript' })
    }
  ]
};

engine.registerPipeline(myPipeline);
```

### Advanced Example with Context Building

```javascript
const deployPipeline = {
  id: 'prepare-deploy',
  version: '1.0.0',
  name: 'Prepare Deployment',
  description: 'Run tests, build, and create deployment PR',
  
  steps: [
    {
      id: 'run-tests',
      name: 'Generate Test Command',
      agent: 'terminalAgent',
      method: 'generate',
      inputFrom: 'context',
      query: 'Generate command to run all tests',
      contextBuilder: (_, ctx) => ({
        os: ctx.environment.os,
        shell: ctx.environment.shell
      })
    },
    {
      id: 'build-cmd',
      name: 'Generate Build Command',
      agent: 'terminalAgent',
      method: 'generate',
      inputFrom: 'context',
      query: 'Generate production build command'
    },
    {
      id: 'github-workflow',
      name: 'Create Deployment PR',
      agent: 'githubAgent',
      method: 'generate',
      inputFrom: 'context',
      query: 'Create deployment PR with test and build commands',
      contextBuilder: (results) => ({
        testCommand: results[0].data.code,
        buildCommand: results[1].data.code
      })
    }
  ]
};
```

---

## 📊 **Pipeline Results**

Every pipeline execution returns a detailed result:

```javascript
{
  pipelineId: 'implement-feature',
  pipelineName: 'Implement Feature',
  success: true,
  totalDuration: 45230,
  startedAt: '2025-12-10T10:30:00.000Z',
  completedAt: '2025-12-10T10:30:45.230Z',
  
  steps: [
    {
      stepId: 'improve-prompt',
      stepName: 'Improve Feature Description',
      success: true,
      duration: 2340,
      timestamp: '2025-12-10T10:30:02.340Z',
      data: { improvedPrompt: '...' },
      signature: {
        hash: '3f2a...',
        signature: 'H/2Ta...',
        publicKey: '03657...',
        signedAt: '2025-12-10T10:30:02.340Z'
      }
    },
    // ... more steps
  ],
  
  actions: [
    {
      type: 'CREATE_FILE',
      targets: ['src/middleware/rateLimiter.js'],
      payload: { content: '...' },
      reasoning: 'Generated by code generator',
      requiresApproval: true
    }
  ],
  
  context: { /* execution context */ }
}
```

---

## ⚙️ **Configuration Options**

```javascript
const engine = new PipelineEngine(client, {
  // Enable verbose logging
  verbose: true,
  
  // Default timeout per step (ms)
  defaultTimeout: 60000,
  
  // Auto-approve all actions (use with caution!)
  autoApprove: false,
  
  // Policy engine instance
  policyEngine: new PolicyEngine(),
  
  // Callback after each step
  onStepComplete: async (result, current, total) => {
    console.log(`Step ${current}/${total} done`);
  },
  
  // Callback for approval requests
  onApprovalRequired: async (request) => {
    // return true to approve, false to reject
    return await promptUser(request);
  }
});
```

---

## 🔧 **API Reference**

### PipelineEngine

#### `constructor(client, options)`
Create new pipeline engine instance.

#### `registerPipeline(definition)`
Register a pipeline for execution.

#### `runPipeline(pipelineId, context)`
Execute a registered pipeline.

#### `listPipelines()`
Get all registered pipelines.

#### `getPipeline(pipelineId)`
Get specific pipeline definition.

#### `unregisterPipeline(pipelineId)`
Remove a pipeline.

### PolicyEngine

#### `constructor(config)`
Create policy engine with optional custom config.

#### `checkAction(action, context)`
Verify if action is allowed.

#### `addRule(rule)`
Add a new policy rule.

#### `removeRule(ruleId)`
Remove a policy rule.

#### `loadPolicy(filePath)`
Load policy from JSON file.

#### `savePolicy(filePath)`
Save current policy to file.

---

## 🎯 **Use Cases**

### 1. Feature Implementation
```bash
npm run engine:implement
> "Add password reset functionality to user service"
```

### 2. Test-Driven Development
```bash
npm run engine:fix-tests
# Analyzes failures, generates fixes, creates diff
```

### 3. Service Scaffolding
```bash
npm run engine:new-service
> "Payment processing microservice with Stripe"
```

### 4. Code Review Automation
```javascript
// Custom pipeline
const reviewPipeline = {
  steps: [
    { agent: 'base', method: 'query', /* analyze code */ },
    { agent: 'codeImprover', method: 'improve', /* suggest fixes */ },
    { agent: 'diffImprover', method: 'improve', /* create diff */ }
  ]
};
```

### 5. CI/CD Integration
```javascript
// Run in GitHub Actions
const result = await engine.runPipeline('fix-tests', {
  testResults: process.env.TEST_OUTPUT
});

if (result.success) {
  // Apply fixes and commit
}
```

---

## 🚨 **Security Best Practices**

1. **Always use PolicyEngine** in production
2. **Never auto-approve** file deletions or commands
3. **Review actions** before applying to files
4. **Whitelist file patterns** for sensitive projects
5. **Use approval callbacks** for human-in-the-loop
6. **Verify BSV signatures** on all agent responses
7. **Audit pipeline logs** for compliance

---

## 🔍 **Troubleshooting**

### Pipeline times out
- Increase `defaultTimeout` option
- Check network connectivity
- Verify API key is valid

### Step fails with policy error
- Review PolicyEngine rules
- Check file patterns match
- Verify command patterns

### Agent returns unexpected data
- Check step `contextBuilder` function
- Verify input source is correct
- Review previous step outputs

---

## 📈 **Next Steps**

**Completed (Phase 1):**
- ✅ Core PipelineEngine
- ✅ PolicyEngine with security rules
- ✅ 3 built-in pipelines
- ✅ Example scripts
- ✅ Tests

**Coming Next (Phase 2):**
- 🔜 VS Code extension
- 🔜 CLI agent with TUI
- 🔜 Pipeline marketplace/registry
- 🔜 Custom policy UI
- 🔜 More built-in pipelines

---

## 💡 **Contributing**

Want to create a custom pipeline? See [CONTRIBUTING.md](./CONTRIBUTING.md)

Ideas for pipelines:
- Database migration generator
- API documentation generator
- Security audit pipeline
- Performance optimization
- Accessibility checker

---

## 📝 **License**

MIT License - see [LICENSE](./LICENSE)

---

**Built with ❤️ using [Schema.ICU](https://schema.icu)**
