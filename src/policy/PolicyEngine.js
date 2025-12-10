/**
 * PolicyEngine - Security and governance layer for pipeline execution
 * 
 * Provides schema-based validation and policy enforcement to prevent
 * malicious or unauthorized actions.
 * 
 * Features:
 * - File access whitelisting/blacklisting
 * - Command pattern validation
 * - Agent/action restrictions
 * - Time-based policies
 * - Approval requirements
 */

class PolicyEngine {
  /**
   * @param {Object} policyConfig - Policy configuration
   */
  constructor(policyConfig = null) {
    this.config = policyConfig || this.getDefaultPolicy();
    this.log('PolicyEngine initialized');
  }

  /**
   * Get default policy configuration
   * @private
   */
  getDefaultPolicy() {
    return {
      version: '1.0.0',
      defaultEffect: 'allow',
      defaultRequiresApproval: true,
      rules: [
        // Deny dangerous file patterns
        {
          id: 'deny-secrets',
          appliesTo: 'action',
          target: ['MODIFY_FILE', 'DELETE_FILE', 'CREATE_FILE'],
          effect: 'deny',
          conditions: {
            deniedFiles: [
              '**/.env',
              '**/.env.*',
              '**/secrets/**',
              '**/credentials/**',
              '**/*.key',
              '**/*.pem',
              '**/id_rsa*'
            ]
          }
        },
        
        // Deny dangerous commands
        {
          id: 'deny-dangerous-commands',
          appliesTo: 'action',
          target: 'RUN_COMMAND',
          effect: 'deny',
          conditions: {
            deniedCommands: [
              'rm -rf /',
              'dd if=',
              'mkfs\\.',
              'wget.*\\|.*sh',
              'curl.*\\|.*bash',
              ':(){ :|:& };:',  // fork bomb
              'chmod -R 777 /'
            ]
          }
        },
        
        // Require approval for file deletions
        {
          id: 'approve-deletions',
          appliesTo: 'action',
          target: 'DELETE_FILE',
          effect: 'allow',
          conditions: {
            requiresApproval: true
          }
        },
        
        // Require approval for all commands
        {
          id: 'approve-commands',
          appliesTo: 'action',
          target: 'RUN_COMMAND',
          effect: 'allow',
          conditions: {
            requiresApproval: true
          }
        }
      ]
    };
  }

  /**
   * Check if a pipeline is allowed to run
   * @param {Object} pipeline - Pipeline definition
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} {allowed: boolean, reason?: string}
   */
  async checkPipeline(pipeline, context) {
    // Check if there's a rule for this specific pipeline
    const rule = this.config.rules.find(r => 
      r.appliesTo === 'pipeline' && 
      (r.target === pipeline.id || (Array.isArray(r.target) && r.target.includes(pipeline.id)))
    );

    if (rule) {
      if (rule.effect === 'deny') {
        return {
          allowed: false,
          reason: `Pipeline ${pipeline.id} is denied by policy rule: ${rule.id}`
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Check if a step is allowed to execute
   * @param {Object} step - Pipeline step
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} {allowed: boolean, reason?: string}
   */
  async checkStep(step, context) {
    // Check if there's a rule for this agent
    const rule = this.config.rules.find(r => 
      r.appliesTo === 'agent' && 
      (r.target === step.agent || (Array.isArray(r.target) && r.target.includes(step.agent)))
    );

    if (rule) {
      if (rule.effect === 'deny') {
        return {
          allowed: false,
          reason: `Agent ${step.agent} is denied by policy rule: ${rule.id}`
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Check if an action is allowed
   * @param {Object} action - Pipeline action
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} {allowed: boolean, reason?: string, requiresApproval?: boolean}
   */
  async checkAction(action, context) {
    let requiresApproval = this.config.defaultRequiresApproval;

    // Find matching rules
    const matchingRules = this.config.rules.filter(r => 
      r.appliesTo === 'action' && 
      (r.target === action.type || (Array.isArray(r.target) && r.target.includes(action.type)))
    );

    for (const rule of matchingRules) {
      // Check file patterns
      if (rule.conditions?.deniedFiles && action.targets) {
        for (const target of action.targets) {
          for (const pattern of rule.conditions.deniedFiles) {
            if (this.matchGlob(target, pattern)) {
              if (rule.effect === 'deny') {
                return {
                  allowed: false,
                  reason: `File ${target} matches denied pattern ${pattern} (rule: ${rule.id})`
                };
              }
            }
          }
        }
      }

      // Check allowed file patterns
      if (rule.conditions?.allowedFiles && action.targets) {
        let fileAllowed = false;
        for (const target of action.targets) {
          for (const pattern of rule.conditions.allowedFiles) {
            if (this.matchGlob(target, pattern)) {
              fileAllowed = true;
              break;
            }
          }
          if (!fileAllowed && rule.effect === 'allow') {
            return {
              allowed: false,
              reason: `File ${target} not in allowed patterns (rule: ${rule.id})`
            };
          }
        }
      }

      // Check command patterns
      if (rule.conditions?.deniedCommands && action.payload?.command) {
        for (const pattern of rule.conditions.deniedCommands) {
          if (this.matchRegex(action.payload.command, pattern)) {
            if (rule.effect === 'deny') {
              return {
                allowed: false,
                reason: `Command matches denied pattern ${pattern} (rule: ${rule.id})`
              };
            }
          }
        }
      }

      // Check allowed command patterns
      if (rule.conditions?.allowedCommands && action.payload?.command) {
        let commandAllowed = false;
        for (const pattern of rule.conditions.allowedCommands) {
          if (this.matchRegex(action.payload.command, pattern)) {
            commandAllowed = true;
            break;
          }
        }
        if (!commandAllowed && rule.effect === 'allow') {
          return {
            allowed: false,
            reason: `Command not in allowed patterns (rule: ${rule.id})`
          };
        }
      }

      // Override approval requirement if specified
      if (rule.conditions?.requiresApproval !== undefined) {
        requiresApproval = rule.conditions.requiresApproval;
      }

      // Check time restrictions
      if (rule.conditions?.timeRestrictions) {
        const now = new Date();
        const hour = now.getHours();
        const day = now.getDay();
        
        const { startHour, endHour, daysOfWeek } = rule.conditions.timeRestrictions;
        
        if (startHour !== undefined && endHour !== undefined) {
          if (hour < startHour || hour >= endHour) {
            return {
              allowed: false,
              reason: `Action not allowed at this time (allowed: ${startHour}:00-${endHour}:00)`
            };
          }
        }
        
        if (daysOfWeek && !daysOfWeek.includes(day)) {
          return {
            allowed: false,
            reason: `Action not allowed on this day of week`
          };
        }
      }
    }

    return { 
      allowed: true,
      requiresApproval 
    };
  }

  /**
   * Simple glob pattern matching
   * @private
   */
  matchGlob(str, pattern) {
    // Convert glob to regex
    const regexPattern = pattern
      .replace(/\./g, '\\.')         // Escape dots first
      .replace(/\*\*/g, '§§§')       // Temporarily replace **
      .replace(/\*/g, '[^/]*')       // * matches anything except /
      .replace(/§§§/g, '.*')         // ** matches anything including /
      .replace(/\?/g, '.');          // ? matches single char
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(str);
  }

  /**
   * Regex pattern matching
   * @private
   */
  matchRegex(str, pattern) {
    try {
      const regex = new RegExp(pattern);
      return regex.test(str);
    } catch (e) {
      console.error(`Invalid regex pattern: ${pattern}`, e);
      return false;
    }
  }

  /**
   * Load policy from file
   * @param {string} filePath - Path to policy JSON file
   */
  async loadPolicy(filePath) {
    const fs = require('fs').promises;
    const content = await fs.readFile(filePath, 'utf-8');
    this.config = JSON.parse(content);
    this.log(`Policy loaded from ${filePath}`);
  }

  /**
   * Save current policy to file
   * @param {string} filePath - Path to save policy JSON
   */
  async savePolicy(filePath) {
    const fs = require('fs').promises;
    await fs.writeFile(filePath, JSON.stringify(this.config, null, 2));
    this.log(`Policy saved to ${filePath}`);
  }

  /**
   * Add a new policy rule
   * @param {Object} rule - Policy rule
   */
  addRule(rule) {
    if (!rule.id) {
      throw new Error('Rule must have an id');
    }
    this.config.rules.push(rule);
    this.log(`Added policy rule: ${rule.id}`);
  }

  /**
   * Remove a policy rule
   * @param {string} ruleId - Rule ID to remove
   */
  removeRule(ruleId) {
    const index = this.config.rules.findIndex(r => r.id === ruleId);
    if (index !== -1) {
      this.config.rules.splice(index, 1);
      this.log(`Removed policy rule: ${ruleId}`);
      return true;
    }
    return false;
  }

  /**
   * Get all rules
   */
  getRules() {
    return this.config.rules;
  }

  /**
   * Logging helper
   * @private
   */
  log(message) {
    // Silent by default, can be overridden
  }
}

module.exports = { PolicyEngine };
