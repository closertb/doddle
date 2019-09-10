module.exports = {
  testRegex: '.*\\.test\\.js$',
  testPathIgnorePatterns: ['/node_modules/'],
  moduleFileExtensions: ['js'],
  collectCoverageFrom: ['/packages/http/src/*.js'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  /*   setupFiles: [
    '<rootDir>/__test__/setup.js'
  ], */
};
