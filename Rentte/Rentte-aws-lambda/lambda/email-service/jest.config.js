module.exports = {
   // Use Node environment for backend
   testEnvironment: "node",
   
   // Automatically clear mock calls and instances between every test
   clearMocks: true,
   
   // Look for test files
   testMatch: [
      "**/tests/**/*.test.js",       // Your custom test folder
      "**/?(*.)+(spec|test).js",      // Default Jest pattern
   ],
   
   // Collect coverage from these source files
   collectCoverage: true,
   collectCoverageFrom: [
      "email/controller/**/*.js",
      "email/routes/**/*.js",
      "config/**/*.js",               // Include config files for coverage (optional)    
      "routes/**/*.js",  
      "helper/**/*.js",
      "validators/**/*.js",
      "!**/node_modules/**",
      "!**/tests/**",                // Exclude test files from coverage
      "!**/config/**",               // Exclude config files (like winston, db, etc.)
   ],
   
   // Directory to output Jest coverage info (used by Sonar)
   coverageDirectory: "coverage",
   
   // Coverage report format SonarQube reads
   coverageReporters: ["lcov", "text", "html"],
   
   // Module name mapper (if using aliases or static files like .svg/.css)
   moduleNameMapper: {
      "\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/__mocks__/fileMock.js",
   },
   
   // Setup files for any global mocks or env vars
   setupFiles: ["dotenv/config"],
   
   // Optional: increase timeout if testing S3/middleware-intensive routes
   testTimeout: 10000,
};
 
