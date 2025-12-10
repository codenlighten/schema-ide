/**
 * Built-in Pipeline Definitions
 * Schema.ICU IDE Platform - Phase 1
 */

const implementFeature = require('./implement-feature');
const fixTests = require('./fix-tests');
const newService = require('./new-service');

module.exports = {
  implementFeature,
  fixTests,
  newService,
  
  // Array of all pipelines for easy iteration
  all: [
    implementFeature,
    fixTests,
    newService
  ]
};
