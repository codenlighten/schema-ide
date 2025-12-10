# Security Policy

## 🔒 **Security Model**

Schema.ICU IDE Platform implements multiple layers of security to ensure safe AI-powered development:

### 1. **PolicyEngine Protection**

All agent actions pass through a mandatory security layer:

```javascript
const policyEngine = new PolicyEngine({
  fileWhitelist: ['src/**/*.js', 'tests/**/*.js'],
  fileBlacklist: ['**/.env', '**/node_modules/**'],
  commandWhitelist: ['^git ', '^npm (install|test|run)', '^node '],
  requireApproval: true
});
```

**Default Security Rules:**
- ✅ Whitelist approved file patterns
- ❌ Block sensitive files (.env, credentials, keys)
- ✅ Restrict allowed commands
- 🔐 Require manual approval for critical actions

### 2. **Cryptographic Verification**

Every Schema.ICU API response includes:
- **BSV Signature** - Cryptographically signed with private key
- **Public Key** - Verify authenticity of responses
- **Timestamp** - Prevent replay attacks

```javascript
// All responses are verified
{
  "signature": "304402...",
  "publicKey": "02c67...",
  "timestamp": 1702345678
}
```

### 3. **Schema Validation**

All agent outputs are validated against strict JSON schemas:
- Type safety guaranteed
- No arbitrary code injection
- Structured, predictable responses

### 4. **Action Auditing**

Complete traceability of all operations:

```javascript
const actions = pipelineEngine.getActions();
// Returns: Array of all file operations, terminal commands, API calls
```

---

## 🚨 **Reporting Vulnerabilities**

We take security seriously. If you discover a security vulnerability:

### **Do Not** Create Public Issues

Please **DO NOT** create public GitHub issues for security vulnerabilities.

### **Do** Contact Us Privately

**Email:** security@smartledger.solutions  
**PGP Key:** [Available on request]

**Include in Your Report:**
1. Description of the vulnerability
2. Steps to reproduce
3. Potential impact assessment
4. Suggested fix (if available)

### **Response Timeline**

- **24 hours** - Initial acknowledgment
- **72 hours** - Preliminary assessment
- **7 days** - Security patch (critical vulnerabilities)
- **30 days** - Public disclosure (coordinated)

---

## 🛡️ **Security Best Practices**

### For Users

1. **API Key Management**
   ```bash
   # Store in environment variables, never commit
   export SCHEMA_ICU_API_KEY="your-key-here"
   export SCHEMA_ICU_EMAIL="your-email"
   ```

2. **PolicyEngine Configuration**
   ```javascript
   // Always use PolicyEngine in production
   const engine = new PipelineEngine({
     client: schemaClient,
     policyEngine: new PolicyEngine({
       requireApproval: true // Manual review required
     })
   });
   ```

3. **Audit Actions**
   ```javascript
   // Review all actions before execution
   const actions = engine.getActions();
   actions.forEach(action => {
     console.log(`${action.type}: ${action.path || action.command}`);
   });
   ```

### For Contributors

1. **No Secrets in Code** - Use environment variables
2. **Dependency Scanning** - Run `npm audit` before commits
3. **Code Review** - All PRs require security review
4. **Test Coverage** - Security-critical code needs 100% coverage

---

## 🔐 **Rate Limits & API Security**

Schema.ICU API implements rate limiting:

| Plan | Requests/Minute | Requests/Day |
|------|----------------|--------------|
| Free | 60 | 1,000 |
| Pro | 600 | 50,000 |
| Enterprise | Custom | Custom |

**Abuse Prevention:**
- IP-based rate limiting
- Token-based authentication
- Automatic throttling on suspicious activity

---

## 📜 **Supported Versions**

| Version | Supported          | End of Life |
|---------|--------------------|-------------|
| 1.x     | ✅ Yes             | TBD         |
| 0.x     | ❌ No (Beta only)  | 2024-01-01  |

---

## 🔍 **Security Audits**

| Date | Auditor | Report |
|------|---------|--------|
| Planned 2024-Q2 | External Firm | TBD |

---

## 📚 **Additional Resources**

- [PolicyEngine Documentation](./docs/PIPELINE_ENGINE.md#policy-engine)
- [BSV Signature Verification](https://schema.icu/docs/security)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)

---

## ⚖️ **Legal**

**Bug Bounty Program:** Coming Q2 2024  
**Responsible Disclosure:** 90-day window before public disclosure  
**Safe Harbor:** Researchers following responsible disclosure are protected

---

**Last Updated:** 2024-01-15  
**Version:** 1.0.0
