/**
 * PipelineEngine Tests
 */

const { PipelineEngine, PolicyEngine } = require('../src');
const { SchemaICU } = require('@smartledger/schema-icu-sdk');

describe('PipelineEngine', () => {
  let client;
  let engine;

  beforeEach(() => {
    client = new SchemaICU();
    engine = new PipelineEngine(client, { verbose: false });
  });

  describe('Initialization', () => {
    test('should create PipelineEngine instance', () => {
      expect(engine).toBeInstanceOf(PipelineEngine);
      expect(engine.client).toBeDefined();
    });

    test('should throw error without SchemaICU client', () => {
      expect(() => new PipelineEngine(null)).toThrow('PipelineEngine requires a SchemaICU client instance');
    });

    test('should initialize with default options', () => {
      expect(engine.options.defaultTimeout).toBe(60000);
      expect(engine.options.autoApprove).toBe(false);
    });
  });

  describe('Pipeline Registration', () => {
    const mockPipeline = {
      id: 'test-pipeline',
      version: '1.0.0',
      name: 'Test Pipeline',
      description: 'A test pipeline',
      steps: [
        {
          id: 'step1',
          name: 'Test Step',
          agent: 'base',
          method: 'query',
          inputFrom: 'user'
        }
      ]
    };

    test('should register a pipeline', () => {
      engine.registerPipeline(mockPipeline);
      const registered = engine.getPipeline('test-pipeline');
      expect(registered).toBeDefined();
      expect(registered.id).toBe('test-pipeline');
    });

    test('should throw error for pipeline without id', () => {
      const invalid = { ...mockPipeline };
      delete invalid.id;
      expect(() => engine.registerPipeline(invalid)).toThrow('Pipeline must have an id');
    });

    test('should throw error for pipeline without steps', () => {
      const invalid = { ...mockPipeline, steps: null };
      expect(() => engine.registerPipeline(invalid)).toThrow('Pipeline must have a steps array');
    });

    test('should list registered pipelines', () => {
      engine.registerPipeline(mockPipeline);
      const list = engine.listPipelines();
      expect(list.length).toBe(1);
      expect(list[0].id).toBe('test-pipeline');
    });

    test('should unregister a pipeline', () => {
      engine.registerPipeline(mockPipeline);
      const removed = engine.unregisterPipeline('test-pipeline');
      expect(removed).toBe(true);
      expect(engine.getPipeline('test-pipeline')).toBeUndefined();
    });
  });

  describe('Step Validation', () => {
    test('should validate step has required fields', () => {
      const invalid = {
        id: 'test',
        name: 'Test',
        steps: [{ id: 'step1' }] // missing agent, method, inputFrom
      };
      
      expect(() => engine.registerPipeline(invalid)).toThrow();
    });
  });

  describe('Pipeline Execution', () => {
    test('should throw error for non-existent pipeline', async () => {
      await expect(engine.runPipeline('non-existent')).rejects.toThrow('Pipeline not found');
    });

    // Note: Full execution tests require live API calls
    // These would be integration tests run separately
  });
});

describe('PolicyEngine', () => {
  let policyEngine;

  beforeEach(() => {
    policyEngine = new PolicyEngine();
  });

  describe('Initialization', () => {
    test('should create PolicyEngine instance', () => {
      expect(policyEngine).toBeInstanceOf(PolicyEngine);
      expect(policyEngine.config).toBeDefined();
    });

    test('should have default rules', () => {
      const rules = policyEngine.getRules();
      expect(rules.length).toBeGreaterThan(0);
    });
  });

  describe('Rule Management', () => {
    test('should add a new rule', () => {
      const rule = {
        id: 'test-rule',
        appliesTo: 'action',
        target: 'TEST_ACTION',
        effect: 'allow'
      };

      policyEngine.addRule(rule);
      const rules = policyEngine.getRules();
      expect(rules.find(r => r.id === 'test-rule')).toBeDefined();
    });

    test('should remove a rule', () => {
      const rule = {
        id: 'test-rule',
        appliesTo: 'action',
        target: 'TEST_ACTION',
        effect: 'allow'
      };

      policyEngine.addRule(rule);
      const removed = policyEngine.removeRule('test-rule');
      expect(removed).toBe(true);
      expect(policyEngine.getRules().find(r => r.id === 'test-rule')).toBeUndefined();
    });
  });

  describe('Action Checking', () => {
    test('should deny actions on secret files', async () => {
      const action = {
        type: 'MODIFY_FILE',
        targets: ['secrets/api.key'],
        payload: {},
        reasoning: 'test',
        requiresApproval: false
      };

      const result = await policyEngine.checkAction(action, {});
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('secrets');
    });

    test('should deny dangerous commands', async () => {
      const action = {
        type: 'RUN_COMMAND',
        targets: [],
        payload: { command: 'rm -rf /' },
        reasoning: 'test',
        requiresApproval: false
      };

      const result = await policyEngine.checkAction(action, {});
      expect(result.allowed).toBe(false);
    });

    test('should allow safe actions', async () => {
      const action = {
        type: 'CREATE_FILE',
        targets: ['src/newfile.js'],
        payload: { content: 'test' },
        reasoning: 'test',
        requiresApproval: false
      };

      const result = await policyEngine.checkAction(action, {});
      expect(result.allowed).toBe(true);
    });
  });

  describe('Glob Matching', () => {
    test('should match glob patterns correctly', () => {
      expect(policyEngine.matchGlob('project/.env', '**/.env')).toBe(true);
      expect(policyEngine.matchGlob('src/.env', '**/.env')).toBe(true);
      expect(policyEngine.matchGlob('config/secrets/key.pem', '**/*.pem')).toBe(true);
      expect(policyEngine.matchGlob('src/file.js', '**/*.pem')).toBe(false);
      expect(policyEngine.matchGlob('project/secrets/api.key', '**/secrets/**')).toBe(true);
      expect(policyEngine.matchGlob('src/app.js', '**/secrets/**')).toBe(false);
    });
  });
});
