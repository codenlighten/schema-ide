const { SchemaICU } = require('@smartledger/schema-icu-sdk');

/**
 * PipelineEngine - Core engine for executing Schema.ICU agent pipelines
 * 
 * This is the foundation of the Schema.ICU IDE platform. It orchestrates
 * multiple AI agents into structured, verifiable workflows.
 * 
 * Features:
 * - Register and execute multi-step pipelines
 * - Context propagation between steps
 * - Error handling and retries
 * - Action collection and approval flows
 * - BSV signature verification
 * 
 * @example
 * const engine = new PipelineEngine(schemaICU);
 * engine.registerPipeline(implementFeaturePipeline);
 * const result = await engine.runPipeline('implement-feature', context);
 */
class PipelineEngine {
  /**
   * @param {SchemaICU} schemaICU - Schema.ICU SDK client instance
   * @param {Object} options - Configuration options
   */
  constructor(schemaICU, options = {}) {
    if (!schemaICU) {
      throw new Error('PipelineEngine requires a SchemaICU client instance');
    }

    this.client = schemaICU;
    this.pipelines = new Map();
    this.policyEngine = options.policyEngine || null;
    this.options = {
      verbose: options.verbose || false,
      defaultTimeout: options.defaultTimeout || 60000, // 60s per step
      autoApprove: options.autoApprove || false,
      onStepComplete: options.onStepComplete || null,
      onApprovalRequired: options.onApprovalRequired || null,
      ...options
    };

    this.log('PipelineEngine initialized');
  }

  /**
   * Register a pipeline definition
   * @param {Object} pipelineDefinition - Pipeline configuration
   * @returns {PipelineEngine} this (for chaining)
   */
  registerPipeline(pipelineDefinition) {
    if (!pipelineDefinition.id) {
      throw new Error('Pipeline must have an id');
    }

    if (!pipelineDefinition.steps || !Array.isArray(pipelineDefinition.steps)) {
      throw new Error('Pipeline must have a steps array');
    }

    // Validate pipeline definition
    this.validatePipelineDefinition(pipelineDefinition);

    this.pipelines.set(pipelineDefinition.id, pipelineDefinition);
    this.log(`Registered pipeline: ${pipelineDefinition.id} (${pipelineDefinition.name})`);

    return this;
  }

  /**
   * Validate a pipeline definition
   * @private
   */
  validatePipelineDefinition(pipeline) {
    // Check all steps have required fields
    pipeline.steps.forEach((step, index) => {
      if (!step.id) {
        throw new Error(`Step ${index} missing id`);
      }
      if (!step.agent) {
        throw new Error(`Step ${step.id} missing agent`);
      }
      if (!step.method) {
        throw new Error(`Step ${step.id} missing method`);
      }
      if (!step.inputFrom) {
        throw new Error(`Step ${step.id} missing inputFrom`);
      }
    });

    return true;
  }

  /**
   * Execute a registered pipeline
   * @param {string} pipelineId - ID of the pipeline to run
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Pipeline result
   */
  async runPipeline(pipelineId, context = {}) {
    const pipeline = this.pipelines.get(pipelineId);
    
    if (!pipeline) {
      throw new Error(`Pipeline not found: ${pipelineId}`);
    }

    this.log(`\n🚀 Starting pipeline: ${pipeline.name}`);
    this.log(`   ID: ${pipelineId}`);
    this.log(`   Steps: ${pipeline.steps.length}`);

    const startTime = Date.now();
    const startedAt = new Date().toISOString();

    // Merge default context with provided context
    const executionContext = {
      ...pipeline.defaultContext,
      ...context,
      stepResults: {}
    };

    const stepResults = [];
    const actions = [];
    let pipelineSuccess = true;
    let pipelineError = null;

    // Check pipeline-level policy
    if (this.policyEngine) {
      const policyCheck = await this.policyEngine.checkPipeline(pipeline, executionContext);
      if (!policyCheck.allowed) {
        throw new Error(`Pipeline blocked by policy: ${policyCheck.reason}`);
      }
    }

    // Request approval if needed
    if (pipeline.requiresApproval && !this.options.autoApprove) {
      const approved = await this.requestApproval({
        type: 'pipeline',
        pipeline: pipeline.name,
        description: pipeline.description
      });
      
      if (!approved) {
        throw new Error('Pipeline execution rejected by user');
      }
    }

    // Execute each step
    for (let i = 0; i < pipeline.steps.length; i++) {
      const step = pipeline.steps[i];
      
      try {
        this.log(`\n📍 Step ${i + 1}/${pipeline.steps.length}: ${step.name}`);
        
        const stepResult = await this.executeStep(step, stepResults, executionContext);
        
        stepResults.push(stepResult);
        
        // Store result in context for future steps
        executionContext.stepResults[step.id] = stepResult.data;
        
        // Collect actions
        if (stepResult.actions) {
          actions.push(...stepResult.actions);
        }

        // Callback
        if (this.options.onStepComplete) {
          await this.options.onStepComplete(stepResult, i + 1, pipeline.steps.length);
        }

        if (!stepResult.success && !step.continueOnError) {
          pipelineSuccess = false;
          pipelineError = stepResult.error;
          this.log(`   ❌ Step failed, stopping pipeline`);
          break;
        }

      } catch (error) {
        const stepResult = {
          stepId: step.id,
          stepName: step.name,
          success: false,
          data: null,
          error: error.message,
          duration: 0,
          timestamp: new Date().toISOString()
        };

        stepResults.push(stepResult);

        if (!step.continueOnError) {
          pipelineSuccess = false;
          pipelineError = error.message;
          this.log(`   ❌ Step error: ${error.message}`);
          break;
        }
      }
    }

    const totalDuration = Date.now() - startTime;
    const completedAt = new Date().toISOString();

    const result = {
      pipelineId: pipeline.id,
      pipelineName: pipeline.name,
      success: pipelineSuccess,
      steps: stepResults,
      totalDuration,
      startedAt,
      completedAt,
      actions,
      error: pipelineError,
      context: executionContext
    };

    this.log(`\n✨ Pipeline ${pipelineSuccess ? 'completed successfully' : 'failed'}`);
    this.log(`   Duration: ${totalDuration}ms`);
    this.log(`   Steps executed: ${stepResults.length}/${pipeline.steps.length}`);
    this.log(`   Actions collected: ${actions.length}`);

    return result;
  }

  /**
   * Execute a single pipeline step
   * @private
   */
  async executeStep(step, previousResults, context) {
    const startTime = Date.now();

    // Build input for this step
    const input = this.buildStepInput(step, previousResults, context);
    
    // Build context for agent call
    const agentContext = step.contextBuilder 
      ? step.contextBuilder(previousResults, context)
      : this.buildDefaultContext(step, context);

    this.log(`   Agent: ${step.agent}.${step.method}`);
    if (step.query) {
      this.log(`   Query: ${step.query.substring(0, 80)}${step.query.length > 80 ? '...' : ''}`);
    }

    // Check step-level policy
    if (this.policyEngine) {
      const policyCheck = await this.policyEngine.checkStep(step, context);
      if (!policyCheck.allowed) {
        throw new Error(`Step blocked by policy: ${policyCheck.reason}`);
      }
    }

    // Request approval if needed
    if (step.requiresApproval && !this.options.autoApprove) {
      const approved = await this.requestApproval({
        type: 'step',
        step: step.name,
        agent: step.agent,
        query: input
      });
      
      if (!approved) {
        throw new Error('Step execution rejected by user');
      }
    }

    // Execute agent method
    const agent = this.client[step.agent];
    if (!agent) {
      throw new Error(`Agent not found: ${step.agent}`);
    }

    const method = agent[step.method];
    if (!method) {
      throw new Error(`Method not found: ${step.agent}.${step.method}`);
    }

    // Call the agent (with timeout)
    const timeout = step.timeout || this.options.defaultTimeout;
    const agentResult = await this.executeWithTimeout(
      method.bind(agent)(input, agentContext),
      timeout
    );

    const duration = Date.now() - startTime;

    // Transform result if transformer provided
    let transformedData = agentResult.data;
    if (step.resultTransform) {
      transformedData = step.resultTransform(agentResult.data, context);
    }

    // Extract actions if present
    const actions = this.extractActions(step, transformedData);

    const result = {
      stepId: step.id,
      stepName: step.name,
      success: agentResult.success,
      data: transformedData,
      duration,
      timestamp: new Date().toISOString(),
      signature: agentResult.signature,
      actions
    };

    this.log(`   ✅ Completed in ${duration}ms`);
    if (agentResult.signature) {
      this.log(`   🔐 Cryptographically signed`);
    }

    return result;
  }

  /**
   * Build input for a step based on inputFrom
   * @private
   */
  buildStepInput(step, previousResults, context) {
    switch (step.inputFrom) {
      case 'user':
        return step.query || context.userPrompt || '';
      
      case 'context':
        return step.query || '';
      
      case 'previousStep':
        if (previousResults.length === 0) {
          throw new Error(`Step ${step.id} requires previous step but none exists`);
        }
        const lastResult = previousResults[previousResults.length - 1];
        return step.query || lastResult.data.code || lastResult.data.improvedCode || JSON.stringify(lastResult.data);
      
      case 'file':
        return step.query || '';
      
      case 'selection':
        return context.selection?.content || step.query || '';
      
      case 'tests':
        return step.query || JSON.stringify(context.testResults || {});
      
      default:
        return step.query || '';
    }
  }

  /**
   * Build default context for agent call
   * @private
   */
  buildDefaultContext(step, context) {
    const defaultContext = {};

    // Add common context fields based on agent type
    if (step.agent === 'codeGenerator') {
      defaultContext.language = context.preferences?.language || 'JavaScript';
    }
    
    if (step.agent === 'terminalAgent') {
      defaultContext.os = context.environment?.os || 'linux';
      defaultContext.shell = context.environment?.shell || 'bash';
    }

    if (step.agent === 'projectPlanner') {
      defaultContext.technology = context.preferences?.framework || 'Node.js';
      defaultContext.experience = context.preferences?.experience || 'intermediate';
    }

    return defaultContext;
  }

  /**
   * Extract actions from agent result
   * @private
   */
  extractActions(step, data) {
    const actions = [];

    // Code-related agents might produce file changes
    if (step.agent === 'codeGenerator' && data.code) {
      actions.push({
        type: 'CREATE_FILE',
        targets: [`generated-${step.id}.${this.getFileExtension(data.language)}`],
        payload: { content: data.code },
        reasoning: data.reasoning || 'Generated by code generator',
        requiresApproval: true
      });
    }

    if (step.agent === 'diffImprover' && data.diff) {
      actions.push({
        type: 'APPLY_DIFF',
        targets: ['current-file'],
        payload: { diff: data.diff },
        reasoning: data.explanation || 'Code improvement',
        requiresApproval: true
      });
    }

    if (step.agent === 'terminalAgent' && data.code) {
      actions.push({
        type: 'RUN_COMMAND',
        targets: [],
        payload: { command: data.code },
        reasoning: data.reasoning || 'Terminal command',
        requiresApproval: true
      });
    }

    if (step.agent === 'githubAgent' && data.githubCommands) {
      data.githubCommands.forEach(cmd => {
        actions.push({
          type: 'RUN_COMMAND',
          targets: [],
          payload: { command: cmd.command },
          reasoning: cmd.description || 'GitHub CLI command',
          requiresApproval: true
        });
      });
    }

    return actions;
  }

  /**
   * Get file extension for a language
   * @private
   */
  getFileExtension(language) {
    const extensions = {
      'javascript': 'js',
      'typescript': 'ts',
      'python': 'py',
      'java': 'java',
      'c++': 'cpp',
      'c#': 'cs',
      'ruby': 'rb',
      'go': 'go',
      'rust': 'rs'
    };
    return extensions[language?.toLowerCase()] || 'txt';
  }

  /**
   * Execute a promise with timeout
   * @private
   */
  async executeWithTimeout(promise, timeoutMs) {
    return Promise.race([
      promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Step timeout after ${timeoutMs}ms`)), timeoutMs)
      )
    ]);
  }

  /**
   * Request approval from user (override this in IDE integrations)
   * @private
   */
  async requestApproval(request) {
    if (this.options.onApprovalRequired) {
      return await this.options.onApprovalRequired(request);
    }

    // Default: auto-approve in non-interactive mode
    this.log(`   ⚠️  Approval required for ${request.type}: ${request.pipeline || request.step}`);
    return true;
  }

  /**
   * Get list of registered pipelines
   */
  listPipelines() {
    return Array.from(this.pipelines.values()).map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      steps: p.steps.length,
      version: p.version
    }));
  }

  /**
   * Get a specific pipeline definition
   */
  getPipeline(pipelineId) {
    return this.pipelines.get(pipelineId);
  }

  /**
   * Remove a pipeline
   */
  unregisterPipeline(pipelineId) {
    return this.pipelines.delete(pipelineId);
  }

  /**
   * Logging helper
   * @private
   */
  log(message) {
    if (this.options.verbose) {
      console.log(message);
    }
  }
}

module.exports = { PipelineEngine };
