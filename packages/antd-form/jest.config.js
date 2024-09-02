module.exports = {
  preset: 'ts-jest/presets/js-with-babel',
  testEnvironment: "node",
  // diagnostics: false,
  // testRegex: '.*\\/__test__\\/.*\\.test\\.js$',
  testRegex: '.*\\/__test__\\/visible\\.test\\.js$',
  // testPathIgnorePatterns: ['/node_modules/'],
  moduleFileExtensions: ['js', 'ts', 'json'],
  collectCoverageFrom: ['./__test__/index.test.js'],
  transformIgnorePatterns: ["node_modules/?!(lodash-es)"]
}
