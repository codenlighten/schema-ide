# Schema.ICU IDE Platform

[![CI](https://github.com/SmartLedgerTech/schema-ide/workflows/CI/badge.svg)](https://github.com/SmartLedgerTech/schema-ide/actions)
[![npm version](https://badge.fury.io/js/%40smartledger%2Fschema-icu-ide-core.svg)](https://www.npmjs.com/package/@smartledger/schema-icu-ide-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)
[![codecov](https://codecov.io/gh/SmartLedgerTech/schema-ide/branch/main/graph/badge.svg)](https://codecov.io/gh/SmartLedgerTech/schema-ide)
[![Downloads](https://img.shields.io/npm/dm/@smartledger/schema-icu-ide-core.svg)](https://www.npmjs.com/package/@smartledger/schema-icu-ide-core)
[![Code Quality](https://img.shields.io/codacy/grade/[PROJECT_ID].svg)](https://www.codacy.com/app/SmartLedgerTech/schema-ide)
[![Schema.ICU](https://img.shields.io/badge/Schema.ICU-Powered-blue.svg)](https://schema.icu)

**AI IDE Platform with Schema-Driven Pipeline Orchestration**

Transform multiple Schema.ICU AI agents into powerful, verifiable workflows with the PipelineEngine - the foundation for building secure AI-powered development tools.

---

## 🎯 **What is Schema.ICU IDE?**

Schema.ICU IDE is a **production-grade AI orchestration platform** that coordinates 11 specialized AI agents into structured, auditable workflows. Unlike traditional AI coding assistants, we provide:

- ⚡ **Multi-Agent Orchestration** - Chain agents into sophisticated development workflows
- 🔒 **Schema-Based Security** - PolicyEngine prevents malicious actions before execution
- 🔐 **Cryptographic Signing** - Every response is BSV-signed for authenticity
- 🎯 **Guaranteed Structure** - JSON Schema validation on all outputs
- 📊 **Full Traceability** - Complete audit trail of all agent actions
- 🔧 **Production Ready** - Powers VS Code extensions, CLI tools, and CI/CD pipelines

---

## 🚀 **Quick Start**

```bash
# Install
npm install @smartledger/schema-icu-ide-core

# Use in your project
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

## 📚 **Documentation**

- [Pipeline Engine Guide](./docs/PIPELINE_ENGINE.md) - Complete orchestration guide
- [Creating Pipelines](./docs/CREATING_PIPELINES.md) - Build custom workflows
- [Policy Engine](./docs/POLICY_ENGINE.md) - Security configuration
- [API Reference](./docs/API_REFERENCE.md) - Full API documentation
- [VS Code Extension](./packages/vscode-extension/README.md) - IDE integration

---

## 🏗️ **Architecture**

```
┌─────────────────────────────────────────────────────┐
│              Schema.ICU IDE Platform                 │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │         PipelineEngine                      │    │
│  │  • Multi-step agent orchestration          │    │
│  │  • Context propagation                     │    │
│  │  • Action collection                        │    │
│  └────────────────────────────────────────────┘    │
│                        ↓                             │
│  ┌────────────────────────────────────────────┐    │
│  │          PolicyEngine                       │    │
│  │  • Schema validation                        │    │
│  │  • File/command whitelisting               │    │
│  │  • Approval requirements                    │    │
│  └────────────────────────────────────────────┘    │
│                        ↓                             │
│  ┌────────────────────────────────────────────┐    │
│  │    11 Schema.ICU AI Agents                  │    │
│  │  base | codeGenerator | schemaGenerator     │    │
│  │  terminalAgent | codeImprover | diffImprover│    │
│  │  boxDesigner | projectPlanner               │    │
│  │  promptImprover | toolChoice | githubAgent  │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 **Use Cases**

### **IDE Extensions**
Build VS Code, JetBrains, or Neovim extensions with verified AI workflows.

### **CI/CD Automation**
Automate code reviews, test fixes, and deployments with cryptographic audit trails.

### **Development Tools**
Create CLI tools, web-based IDEs, or custom automation with structured AI.

### **Enterprise Governance**
Deploy AI coding assistants with policy enforcement and compliance logging.

---

## 📦 **Installation**

```bash
npm install @smartledger/schema-icu-ide-core
```

**Prerequisites:**
- Node.js >= 14.0.0
- Schema.ICU API key ([get one free](https://schema.icu))

---

## 🔧 **Project Structure**

```
schema-icu-ide-core/
├── src/
│   ├── engine/          # PipelineEngine core
│   ├── policy/          # PolicyEngine security
│   ├── pipelines/       # Built-in pipelines
│   └── types/           # TypeScript definitions
├── packages/
│   ├── vscode-extension/   # VS Code integration
│   ├── cli/               # Command-line tool
│   └── registry/          # Pipeline marketplace
├── examples/
│   ├── custom-pipelines/  # Example workflows
│   └── integrations/      # IDE integrations
├── docs/
│   ├── PIPELINE_ENGINE.md
│   ├── CREATING_PIPELINES.md
│   └── API_REFERENCE.md
└── tests/
    └── engine/           # Test suites
```

---

## 🚨 **Security**

Schema.ICU IDE is designed with security as a first-class concern:

- ✅ **Schema-validated actions** - All operations conform to strict schemas
- ✅ **Cryptographic signing** - BSV signatures on every AI response
- ✅ **Policy enforcement** - Whitelist/blacklist files and commands
- ✅ **Human-in-the-loop** - Approval workflows for sensitive operations
- ✅ **Audit trails** - Complete traceability of all actions

See [Security Guide](./docs/SECURITY.md) for details.

---

## 🤝 **Contributing**

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

**Ideas for contributions:**
- Custom pipeline examples
- IDE integrations
- Policy templates
- Documentation improvements

---

## 🔗 **Links**

- **Schema.ICU Platform**: https://schema.icu
- **SDK Examples**: https://github.com/codenlighten/schema-icu-sdk-example
- **Documentation**: https://schema.icu/docs
- **Support**: support@smartledger.technology
- **Enterprise**: enterprise@smartledger.technology

---

## 📄 **License**

MIT License - see [LICENSE](./LICENSE)

---

## 🙏 **Acknowledgments**

Built with ❤️ by [SmartLedger Technologies](https://smartledger.technology)

Powered by [Schema.ICU](https://schema.icu) - Structured AI. Verified. Trusted.

---

**Phase 1 Complete** ✅ - Pipeline Engine Foundation  
**Next**: VS Code Extension, CLI Tool, Pipeline Marketplace
