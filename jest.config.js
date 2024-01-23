module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  setupFiles: ['./__tests__/env.js'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  testRunner: 'jest-circus/runner',
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  verbose: true,
  coverageReporters: ["json-summary"]
}