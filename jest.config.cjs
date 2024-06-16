module.exports = {
  // Specify the root directory of your test files
  roots: ['<rootDir>/dist/__tests__'],
  // Configure Jest to only look for test files in the commonjs dist/__tests__ directory
  testMatch: ['<rootDir>/dist/__tests__/**/*.test.js'],
  // Use ts-jest for transforming TypeScript files
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  // Map the 'fs' module to the specific mock file you want to use
  moduleNameMapper: {
    '^fs$': '<rootDir>/dist/__mocks__/fs.js',
    '^puppeteer$': '<rootDir>/dist/__mocks__/puppeteer.js', // Ensure this is included
  },
  // Other Jest configuration options as needed
  collectCoverage: true,
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
};