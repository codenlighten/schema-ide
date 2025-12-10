/**
 * Pipeline Engine Type Definitions
 * Schema.ICU AI IDE Platform - Phase 1
 */

/**
 * Agent names available in Schema.ICU
 */
export type AgentName =
  | 'base'
  | 'codeGenerator'
  | 'schemaGenerator'
  | 'terminalAgent'
  | 'codeImprover'
  | 'diffImprover'
  | 'boxDesigner'
  | 'projectPlanner'
  | 'promptImprover'
  | 'toolChoice'
  | 'githubAgent';

/**
 * Method names for each agent
 */
export type AgentMethod =
  | 'query'           // base
  | 'generate'        // codeGenerator, schemaGenerator, terminalAgent, githubAgent
  | 'improve'         // codeImprover, diffImprover, promptImprover
  | 'design'          // boxDesigner
  | 'plan'            // projectPlanner
  | 'recommend';      // toolChoice

/**
 * Source of input data for a pipeline step
 */
export type InputSource =
  | 'user'            // Direct user input
  | 'file'            // Read from file
  | 'previousStep'    // Output from previous step
  | 'context'         // From pipeline context
  | 'tests'           // From test execution
  | 'selection';      // From IDE selection

/**
 * Action types that can be emitted by pipeline steps
 */
export type ActionType =
  | 'APPLY_DIFF'
  | 'CREATE_FILE'
  | 'MODIFY_FILE'
  | 'DELETE_FILE'
  | 'RUN_COMMAND'
  | 'CREATE_BRANCH'
  | 'COMMIT_CHANGES'
  | 'SHOW_MESSAGE'
  | 'REQUEST_APPROVAL';

/**
 * Single step in a pipeline
 */
export interface PipelineStep {
  /** Unique identifier for this step */
  id: string;
  
  /** Human-readable name */
  name: string;
  
  /** Description of what this step does */
  description?: string;
  
  /** Which agent to invoke */
  agent: AgentName;
  
  /** Which method to call on the agent */
  method: AgentMethod;
  
  /** Where to get the query/input from */
  inputFrom: InputSource;
  
  /** Optional: custom query template or string */
  query?: string;
  
  /** Optional: transform function to build context from previous results */
  contextBuilder?: (results: PipelineStepResult[], context: PipelineContext) => any;
  
  /** Optional: transform function to process the result */
  resultTransform?: (result: any, context: PipelineContext) => any;
  
  /** Optional: validation schema for the result */
  validation?: any;
  
  /** Whether this step requires human approval before execution */
  requiresApproval?: boolean;
  
  /** Maximum execution time in ms */
  timeout?: number;
  
  /** Whether to continue pipeline if this step fails */
  continueOnError?: boolean;
}

/**
 * Result from executing a single pipeline step
 */
export interface PipelineStepResult {
  /** Step ID */
  stepId: string;
  
  /** Step name */
  stepName: string;
  
  /** Whether the step succeeded */
  success: boolean;
  
  /** The data returned by the agent */
  data: any;
  
  /** Error if step failed */
  error?: string;
  
  /** Execution duration in ms */
  duration: number;
  
  /** Timestamp when step completed */
  timestamp: string;
  
  /** BSV signature from Schema.ICU */
  signature?: {
    hash: string;
    signature: string;
    publicKey: string;
    signedAt: string;
  };
  
  /** Actions suggested by this step */
  actions?: PipelineAction[];
}

/**
 * An action that can be performed (file edit, command, etc.)
 */
export interface PipelineAction {
  /** Type of action */
  type: ActionType;
  
  /** Target files or resources */
  targets?: string[];
  
  /** Payload specific to action type */
  payload: {
    diff?: string;
    content?: string;
    command?: string;
    message?: string;
    [key: string]: any;
  };
  
  /** Reasoning for this action */
  reasoning: string;
  
  /** Whether this action requires approval */
  requiresApproval: boolean;
  
  /** Whether this action was approved */
  approved?: boolean;
}

/**
 * Complete pipeline definition
 */
export interface PipelineDefinition {
  /** Unique identifier */
  id: string;
  
  /** Semantic version */
  version: string;
  
  /** Human-readable name */
  name: string;
  
  /** Detailed description */
  description: string;
  
  /** Author/creator */
  author?: string;
  
  /** Tags for categorization */
  tags?: string[];
  
  /** Required Schema.ICU tier (free, registered, professional, enterprise) */
  requiredTier?: string;
  
  /** Array of steps to execute */
  steps: PipelineStep[];
  
  /** Default context/options */
  defaultContext?: Record<string, any>;
  
  /** Whether entire pipeline requires approval before starting */
  requiresApproval?: boolean;
  
  /** Maximum total execution time in ms */
  timeout?: number;
  
  /** BSV signature of this pipeline definition (for marketplace) */
  signature?: {
    hash: string;
    signature: string;
    publicKey: string;
    signedAt: string;
  };
}

/**
 * Context passed through pipeline execution
 */
export interface PipelineContext {
  /** Initial user query/prompt */
  userPrompt?: string;
  
  /** Current project directory */
  projectRoot?: string;
  
  /** Files in scope */
  files?: string[];
  
  /** Selected code/text */
  selection?: {
    file: string;
    content: string;
    range?: { start: number; end: number };
  };
  
  /** Test results */
  testResults?: any;
  
  /** Environment info */
  environment?: {
    os: string;
    shell: string;
    editor: string;
  };
  
  /** User preferences */
  preferences?: {
    language?: string;
    framework?: string;
    experience?: string;
  };
  
  /** Accumulated results from previous steps */
  stepResults?: Record<string, any>;
  
  /** Custom data */
  [key: string]: any;
}

/**
 * Result from executing a complete pipeline
 */
export interface PipelineResult {
  /** Pipeline ID */
  pipelineId: string;
  
  /** Pipeline name */
  pipelineName: string;
  
  /** Overall success status */
  success: boolean;
  
  /** Results from each step */
  steps: PipelineStepResult[];
  
  /** Total execution time in ms */
  totalDuration: number;
  
  /** When pipeline started */
  startedAt: string;
  
  /** When pipeline completed */
  completedAt: string;
  
  /** All actions collected from steps */
  actions: PipelineAction[];
  
  /** Summary/final output */
  summary?: string;
  
  /** Error if pipeline failed */
  error?: string;
  
  /** Context used */
  context: PipelineContext;
}

/**
 * Policy rules for restricting pipeline/step execution
 */
export interface PolicyRule {
  /** Rule ID */
  id: string;
  
  /** What this rule applies to */
  appliesTo: 'pipeline' | 'step' | 'action' | 'agent';
  
  /** Target (pipeline ID, agent name, action type, etc.) */
  target: string | string[];
  
  /** Allow or deny */
  effect: 'allow' | 'deny';
  
  /** Conditions that must be met */
  conditions?: {
    /** Allowed file patterns (glob) */
    allowedFiles?: string[];
    
    /** Denied file patterns (glob) */
    deniedFiles?: string[];
    
    /** Allowed commands (regex patterns) */
    allowedCommands?: string[];
    
    /** Denied commands (regex patterns) */
    deniedCommands?: string[];
    
    /** Require approval */
    requiresApproval?: boolean;
    
    /** Time restrictions */
    timeRestrictions?: {
      startHour?: number;
      endHour?: number;
      daysOfWeek?: number[];
    };
  };
}

/**
 * Policy configuration for a project
 */
export interface PolicyConfig {
  /** Policy version */
  version: string;
  
  /** Rules to apply */
  rules: PolicyRule[];
  
  /** Default action when no rule matches */
  defaultEffect: 'allow' | 'deny';
  
  /** Whether to require approval for all actions by default */
  defaultRequiresApproval: boolean;
}
