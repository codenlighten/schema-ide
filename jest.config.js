module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Verbose output
  verbose: true,

  // Test timeout (60 seconds for API calls)
  testTimeout: 60000,

  // Coverage configuration
  collectCoverageFrom: [
    'index.js',
    'cli.js',
    'examples/**/*.js',
    '!examples/outputs/**',
    '!node_modules/**',
  ],

  // Test match patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.js',
  ],

  // Clear mocks between tests
  clearMocks: true,

  // Coverage thresholds (optional - uncomment to enforce)
  // coverageThreshold: {
  //   global: {
  //     branches: 70,
  //     functions: 70,
  //     lines: 70,
  //     statements: 70
  //   }
  // },

  // Setup files
  // setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Module paths
  moduleDirectories: ['node_modules'],

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/examples/outputs/',
  ],

  // Transform (if needed for ES modules)
  // transform: {},
};
