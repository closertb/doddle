'use strict';
// Do this as the first thing so that any code reading it knows the right env.
process.env.NODE_ENV = 'development';

const { createCompiler } = require('./base');


createCompiler({
  DEPLOY_ENV: 'local',
  PUBLISH_ENV: 'local',
}).then((compiler) => {
  compiler.start({
    host: 'local.keruyun.test',
  });
});