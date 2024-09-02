module.exports = {
  // testPathIgnorePatterns: ['/node_modules/'],
  collectCoverageFrom: ['/packages/**/*.test.js'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  preset: 'ts-jest/presets/js-with-babel',
  testEnvironment: "node",
  // diagnostics: false,
  // testRegex: '.*\\/__test__\\/.*\\.test\\.js$',
  testRegex: '.*\\/__test__\\/visible\\.test\\.js$',
  // testPathIgnorePatterns: ['/node_modules/'],
  moduleFileExtensions: ['js', 'ts', 'json'],
  transformIgnorePatterns: ["node_modules/?!(lodash-es)"]
};
