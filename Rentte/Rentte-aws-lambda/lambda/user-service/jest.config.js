module.exports = {
   // Use Node environment for backend
   testEnvironment: "node",
    
   // Automatically clear mock calls and instances between every test
   clearMocks: true,
    
   // Look for test files in these directories
   testMatch: [
      "**/unit-test/**/*.test.js",
      "**/integration-test/**/*.test.js",
      "**/?(*.)+(spec|test).js",
   ],
    
   // Collect coverage information
   collectCoverage: true,
    
   // Specify which files to collect coverage from
   collectCoverageFrom: [
      "user/controller/**/*.js",
      "user/routes/**/*.js",
      "config/**/*.js",
      "helper/**/*.js",
      "validators/**/*.js",
      "middleware/**/*.js",
      // Exclude these patterns
      "!**/node_modules/**",
      "!**/coverage/**",
      "!**/unit-test/**",
      "!**/integration-test/**",
      "!**/tests/**",
      "!**/*.config.js",
      "!**/index.js",
   ],
    
   // Directory where Jest should output coverage files
   coverageDirectory: "coverage",
    
   // Coverage reporters to use
   coverageReporters: [
      "lcov",     // Creates lcov.info file (used by SonarQube)
      "text",     // Outputs coverage to console
      "html",     // Creates a nice HTML report
      "json",      // Creates a JSON file with coverage data
   ],
    
   // Minimum coverage thresholds
   coverageThreshold: {
      global: {
         branches: 80,
         functions: 80,
         lines: 80,
         statements: 80,
      },
   },
    
   // Files to run before tests
   setupFiles: ["dotenv/config"],
    
   // Module name mapper for handling file imports
   moduleNameMapper: {
      "\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/unit-test/mocks/fileMock.js",
      "\\.(css|less|scss|sass)$": "<rootDir>/unit-test/mocks/styleMock.js",
   },
    
   // Ignore patterns
   testPathIgnorePatterns: [
      "/node_modules/",
      "/coverage/",
   ],
    
   // Verbose output
   verbose: true,
    
   // Maximum test timeout
   testTimeout: 10000,
    
   // Force coverage collection from untested files
   forceCoverageMatch: ["**/*.js"],
    
   // Display individual test results
   displayName: "User Service Tests",
    
   // Error if no tests are found
   errorOnDeprecated: true,
    
   // Detect open handles
   detectOpenHandles: true,
    
   // Stop running tests after first failure
   bail: false,
    
   // Maximum workers
   maxWorkers: "50%",
};
