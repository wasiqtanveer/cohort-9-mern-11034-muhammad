module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.css$': '<rootDir>/src/__mocks__/styleMock.cjs',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/main.jsx',
    '!src/**/__mocks__/**',
    '!src/**/*.test.{js,jsx}',
  ],
  coverageReporters: ['text-summary', 'lcov'],
  coverageDirectory: 'coverage',
}

//jest default enviroment is Node, and it doesnt have any window , so jsdom is a fake browser made in JS so that out react components can render into someting

//setupFilesAfterEnv → Tells Jest which file to run before your tests. You put things there that should be available for all tests, such as importing @testing-library/jest-dom.