# Schema.ICU Pipeline Engine ⚙️

[![CI](https://github.com/SmartLedgerTech/schema-ide/workflows/CI/badge.svg)](https://github.com/SmartLedgerTech/schema-ide/actions)
[![npm version](https://badge.fury.io/js/%40smartledger%2Fschema-icu-ide-core.svg)](https://www.npmjs.com/package/@smartledger/schema-icu-ide-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)
[![Schema.ICU](https://img.shields.io/badge/Schema.ICU-Powered-blue.svg)](https://schema.icu)

**AI Orchestration Framework with Schema-Driven Multi-Agent Workflows**

> ⚠️ **HONEST STATUS:** We're at **Phase 1** (Engine Complete). CLI tool and VS Code extension coming in Phases 2 & 3.

Transform multiple Schema.ICU AI agents into powerful, verifiable workflows with the PipelineEngine - the **foundation** for building AI-powered development tools (not the IDE itself... yet).

---

## 🎯 **What is This?**

### **What It Actually Is** ✅

This is an **AI orchestration framework** (like Langchain or AutoGPT) that:

- ⚡ **Orchestrates 11 AI Agents** - Chain agents into sophisticated workflows
- 🔒 **Enforces Security** - PolicyEngine prevents malicious actions
- 🔐 **Signs Everything** - BSV cryptographic signatures for authenticity
- 🎯 **Guarantees Structure** - JSON Schema validation on all outputs
- 📊 **Tracks Everything** - Complete audit trail of all agent actions
- 📦 **Node.js Library** - Programmatic API for building AI tools

### **What It's NOT (Yet)** ❌

This is **NOT** a full IDE like VS Code or Cursor:

- ❌ No code editor or UI
- ❌ No visual debugging
- ❌ No file explorer
- ❌ No terminal integration (yet)
- ❌ No command palette (yet)

### **The Vision** 🎨

This engine is **Phase 1** of building a complete AI IDE:

```
┌─────────────────┐     ┌──────────────┐     ┌──────────────────┐
│ Pipeline Engine │ ──▶ │  CLI Tool    │ ──▶ │ VS Code Extension│
│   (Phase 1)     │     │  (Phase 2)   │     │   (Phase 3)      │
│  ✅ COMPLETE    │     │  🚧 BUILDING │     │   ❌ PLANNED     │
└─────────────────┘     └──────────────┘     └──────────────────┘
    You are here!         Coming soon!          Future goal!
```

**Think of it like:** We built the engine, now we're building the car and the controls.

---

## 📊 **Comparison: What We're Like**

| Feature | Schema.ICU<br>Pipeline Engine | Langchain | Cursor IDE | GitHub Copilot |
|---------|-------------------------------|-----------|------------|----------------|
| **Type** | Orchestration Framework | Orchestration Framework | Full IDE | IDE Extension |
| **UI** | ❌ None (API only) | ❌ None (API only) | ✅ Full Editor | ✅ Inline Editor |
| **Multi-Agent** | ✅ 11 Agents | ✅ Custom Chains | ✅ Multiple Models | ❌ Single Model |
| **Security** | ✅ PolicyEngine | ⚠️ Manual | ⚠️ Basic | ⚠️ Cloud-based |
| **Signatures** | ✅ BSV Crypto | ❌ No | ❌ No | ❌ No |
| **Schema Validation** | ✅ Enforced | ⚠️ Optional | ❌ No | ❌ No |
| **CLI Tool** | 🚧 Phase 2 | ✅ Yes | ✅ Yes | ✅ Yes |
| **IDE Extension** | ❌ Phase 3 | ⚠️ Community | ✅ Native | ✅ Native |

**TL;DR:** We're like **Langchain** (orchestration), not **Cursor** (IDE)... *yet*.

---

## 🚀 **Quick Start**

### **Installation**

```bash
npm install @smartledger/schema-icu-ide-core
```

### **Basic Usage**

```javascript
const { SchemaICU } = require('@smartledger/schema-icu-sdk');
const { PipelineEngine, PolicyEngine, implementFeature } = require('@smartledger/schema-icu-ide-core');

// Initialize
const client = new SchemaICU();
const engine = new PipelineEngine(client, {
  policyEngine: new PolicyEngine(),
  verbose: true
});

// Register and run pipelines
engine.registerPipeline(implementFeature);
const result = await engine.runPipeline('implement-feature', {
  userPrompt: 'Create a rate limiting middleware',
  preferences: { language: 'JavaScript' }
});

console.log(result.steps[3].data.code); // Generated code
```

---

## ✨ **Key Features**

### 🔗 **Pipeline Orchestration**
Chain multiple AI agents into complex workflows with context propagation, error handling, and approval flows.

### 🔒 **Policy Engine**
Schema-based security rules prevent unauthorized file access, dangerous commands, and malicious actions.

### 🎯 **Built-in Pipelines**
- **implement-feature** - Full feature implementation (6 steps)
- **fix-tests** - Analyze and fix failing tests (5 steps)
- **new-service** - Scaffold complete microservices (7 steps)

### 🛡️ **Security First**
Designed post-IDEsaster with schema validation, command whitelisting, and cryptographic verification.

### 📦 **Extensible**
Create custom pipelines, add policy rules, integrate with any IDE or CI/CD system.

---

## 🚧 **Current Limitations**

Let's be honest about what's NOT built yet:

| Limitation | Status | ETA |
|------------|--------|-----|
| ❌ No CLI tool (`npx schema-icu pipeline run`) | 🚧 Phase 2 | Q1 2025 |
| ❌ No VS Code extension | ❌ Phase 3 | Q2 2025 |
| ❌ No visual UI | ❌ Phase 3 | Q2 2025 |
| ❌ No file editing UI | ❌ Phase 3 | Q2 2025 |
| ❌ No debugging interface | ❌ Phase 3+ | TBD |
| ❌ Not published to NPM | 🚧 Coming | Jan 2025 |
| ⚠️ Only 1 commit in repo | 🚧 Growing | Ongoing |
| ⚠️ No demo videos | 🚧 Coming | Jan 2025 |

**What works TODAY:** Programmatic API for Node.js projects. You write code to orchestrate agents.

---

## 📚 **Documentation**

- [Pipeline Engine Guide](./docs/PIPELINE_ENGINE.md) - Complete orchestration docs
- [Creating Custom Pipelines](./docs/PIPELINE_ENGINE.md#creating-custom-pipelines)
- [Policy Engine Security](./docs/PIPELINE_ENGINE.md#policy-engine)
- [API Reference](./docs/PIPELINE_ENGINE.md#api-reference)
- [Examples](./examples/) - Working code samples

---

## 🛣️ **Roadmap**

### ✅ **Phase 1: Pipeline Engine** (COMPLETE)
- [x] PipelineEngine core orchestration
- [x] PolicyEngine security layer
- [x] 3 built-in pipelines
- [x] TypeScript definitions
- [x] Jest test suite
- [x] Comprehensive documentation

### 🚧 **Phase 2: CLI Tool** (IN PROGRESS)
- [ ] `npx schema-icu pipeline list` - Show available pipelines
- [ ] `npx schema-icu pipeline run <name>` - Execute pipelines from terminal
- [ ] `npx schema-icu pipeline create` - Interactive pipeline builder
- [ ] `npx schema-icu pipeline validate` - Test custom pipelines
- [ ] `npx schema-icu new` - Project bootstrapping wizard

### ❌ **Phase 3: VS Code Extension** (PLANNED)
- [ ] Command palette integration
- [ ] Visual pipeline execution
- [ ] Inline code editing
- [ ] Diff preview UI
- [ ] Settings/configuration UI
- [ ] Approval workflow UI

### ❌ **Phase 4: Marketplace** (FUTURE)
- [ ] Pipeline registry
- [ ] Community pipelines
- [ ] Pipeline versioning
- [ ] On-chain verification
- [ ] Monetization layer

---

## 🔧 **Examples**

### **Run a Complete Feature Implementation**

```javascript
const result = await engine.runPipeline('implement-feature', {
  userPrompt: 'Add JWT authentication to Express API',
  projectContext: { framework: 'Express', hasDatabase: true },
  preferences: { language: 'JavaScript', includeTests: true }
});

// result.steps[0] - Improved prompt
// result.steps[1] - Task breakdown
// result.steps[2] - JSON schemas
// result.steps[3] - Generated code
// result.steps[4] - Improved code
// result.steps[5] - Git diffs
```

### **Fix Failing Tests**

```javascript
const result = await engine.runPipeline('fix-tests', {
  userPrompt: 'Fix the failing authentication tests',
  testOutput: '... test error logs ...',
  codeContext: '... relevant code files ...'
});
```

### **Scaffold a New Service**

```javascript
const result = await engine.runPipeline('new-service', {
  userPrompt: 'Create a payment processing microservice',
  preferences: {
    framework: 'Fastify',
    database: 'PostgreSQL',
    includeDocker: true
  }
});
```

---

## 🤝 **Contributing**

We're building this in public! Check out:

- [CONTRIBUTING.md](./CONTRIBUTING.md) - How to contribute
- [Good First Issues](https://github.com/codenlighten/schema-ide/labels/good-first-issue)
- [Phase 2 Roadmap](./docs/ROADMAP.md) - Help build the CLI!

---

## 📄 **License**

MIT License - see [LICENSE](./LICENSE)

---

## 🔗 **Links**

- [Schema.ICU Platform](https://schema.icu)
- [SDK Examples](https://github.com/codenlighten/schema-icu-sdk-example)
- [Documentation](./docs/)
- [NPM Package](https://www.npmjs.com/package/@smartledger/schema-icu-ide-core) (coming soon)

---

**Built with ❤️ by [SmartLedger](https://smartledger.solutions)**
