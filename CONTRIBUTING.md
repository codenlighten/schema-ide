# Contributing to Schema.ICU IDE Core

Thank you for your interest in contributing to the Schema.ICU IDE Platform! This project powers AI-driven development tools with verifiable, secure agent orchestration.

## 🚀 Getting Started

### Prerequisites
- Node.js >= 14.0.0
- npm >= 6.0.0
- Schema.ICU API credentials ([get them free](https://schema.icu))

### Setup
```bash
# Clone the repository
git clone https://github.com/codenlighten/schema-ide.git
cd schema-ide

# Install dependencies
npm install

# Run tests
npm test

# Try examples
npm run demo
npm run example:implement
```

---

## 📝 How to Contribute

### Reporting Bugs
1. Check [Issues](https://github.com/codenlighten/schema-ide/issues) for existing reports
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (Node version, OS)
   - Code samples if applicable

### Suggesting Features
1. Check [Issues](https://github.com/codenlighten/schema-ide/issues) for similar suggestions
2. Create a new issue tagged `enhancement`:
   - Clear use case description
   - Proposed solution
   - Alternative approaches considered
   - Example code if applicable

### Submitting Pull Requests

#### 1. Fork and Clone
```bash
# Fork on GitHub, then:
git clone https://github.com/YOUR_USERNAME/schema-ide.git
cd schema-ide
git remote add upstream https://github.com/codenlighten/schema-ide.git
```

#### 2. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

#### 3. Make Your Changes
- Write clear, commented code
- Follow existing code style
- Add tests for new features
- Update documentation as needed

#### 4. Test Your Changes
```bash
npm run lint
npm run format
npm test
npm run demo
```

#### 5. Commit Your Changes
```bash
git add .
git commit -m "feat: add custom pipeline example"
```

**Commit Message Guidelines:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `test:` Adding/updating tests
- `refactor:` Code refactoring
- `style:` Formatting changes
- `chore:` Maintenance tasks

#### 6. Push and Create PR
```bash
git push origin feature/your-feature-name
```

Create a Pull Request on GitHub with:
- Clear description of changes
- Link to related issues
- Screenshots/examples if applicable

---

## 🎨 Code Style

- **JavaScript**: ES6+ CommonJS modules
- **Indentation**: 2 spaces
- **Quotes**: Single quotes
- **Semicolons**: Required
- **Comments**: JSDoc for public APIs
- **Naming**: camelCase for variables/functions, PascalCase for classes

**Run formatter:**
```bash
npm run format
```

---

## 📦 Project Structure

```
schema-ide/
├── src/
│   ├── engine/          # PipelineEngine core
│   ├── policy/          # PolicyEngine security
│   ├── pipelines/       # Built-in pipelines
│   ├── types/           # TypeScript definitions
│   └── index.js         # Main exports
├── examples/
│   ├── pipeline-engine-demo.js
│   ├── run-implement-feature.js
│   ├── run-fix-tests.js
│   └── run-new-service.js
├── tests/
│   └── pipeline-engine.test.js
├── docs/
│   ├── PIPELINE_ENGINE.md
│   ├── ROADMAP.md
│   └── API_REFERENCE.md
└── packages/           # Future: VS Code ext, CLI, etc.
```

---

## 🧪 Testing Guidelines

### Writing Tests
- Place tests in `tests/` directory
- Name test files: `*.test.js`
- Use descriptive test names
- Test both success and error cases
- Mock external dependencies

### Running Tests
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
```

### Test Coverage
Aim for high coverage on:
- PipelineEngine core logic
- PolicyEngine security rules
- Pipeline step execution
- Error handling

---

## 📚 Adding Custom Pipelines

Create a new pipeline in `src/pipelines/`:

```javascript
const myPipeline = {
  id: 'my-custom-pipeline',
  version: '1.0.0',
  name: 'My Custom Pipeline',
  description: 'What it does',
  steps: [
    {
      id: 'step-1',
      name: 'First Step',
      agent: 'codeGenerator',
      method: 'generate',
      inputFrom: 'user',
      continueOnError: false
    }
    // ... more steps
  ]
};

module.exports = myPipeline;
```

Then add example usage in `examples/`.

---

## 🔒 Security Contributions

We take security seriously. If you find a security vulnerability:

1. **DO NOT** open a public issue
2. Email: security@smartledger.technology
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

---

## 📄 Documentation

When adding features:
- Update relevant docs in `docs/`
- Add JSDoc comments to functions
- Include usage examples
- Update CHANGELOG.md

---

## ❓ Questions?

- Open a [Discussion](https://github.com/codenlighten/schema-ide/discussions)
- Email: codenlighten1@gmail.com
- Check [Schema.ICU Docs](https://schema.icu/docs)

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Schema.ICU IDE! 🙏**
