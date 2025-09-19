/** @type {import('jest').Config} */
const config = {
  moduleNameMapper: {
    '^angularx-social-login$': '<rootDir>/projects/angularx-social-login/src/public-api.ts',
  },
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
};

module.exports = config;
