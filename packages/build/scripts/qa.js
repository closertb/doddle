'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.NODE_ENV = 'production';

const chalk = require('chalk');
const { createCompiler } = require('./base');

createCompiler({
  DEPLOY_ENV: 'qa',
  PUBLISH_ENV: 'qa',
}).then((compiler) => {
  compiler.build();
});
