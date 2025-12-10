/**
 * Schema.ICU IDE Platform - Core Engine
 * Phase 1: Pipeline Engine Foundation
 * 
 * @module @smartledger/schema-icu-ide-core
 */

const { PipelineEngine } = require('./engine/PipelineEngine');
const { PolicyEngine } = require('./policy/PolicyEngine');
const pipelines = require('./pipelines');

module.exports = {
  // Core classes
  PipelineEngine,
  PolicyEngine,
  
  // Built-in pipelines
  pipelines,
  
  // Convenience exports
  implementFeature: pipelines.implementFeature,
  fixTests: pipelines.fixTests,
  newService: pipelines.newService
};
