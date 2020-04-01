'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.NODE_ENV = 'qa';
process.env.DEPLOY_ENV = 'qa';
// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

const chalk = require('chalk');
const { build } = require('./base');

// Create a webpack compiler that is configured with custom messages.
// Load proxy config
// const proxySetting = require(paths.appPackageJson).proxy;
// const proxyConfig = prepareProxy(proxySetting, paths.appPublic);
// Serve webpack assets generated by the compiler over a web server.
/* const serverConfig = createDevServerConfig(
  proxyConfig,
  urls.lanUrlForConfig
); */

build('development')
  .then(({ warnings }) => {
    // console.log('va:', stats, previousFileSizes);
    if (warnings.length) {
      console.log(chalk.yellow('Compiled with warnings.\n'));
      console.log(warnings.join('\n\n'));
      console.log(
        '\nSearch for the ' +
          chalk.underline(chalk.yellow('keywords')) +
          ' to learn more about each warning.'
      );
      console.log();
    } else {
      console.log(chalk.green('Compiled successfully!\n'));
    }
    // console.log(`step last: Compiled successfully, the size is ${chalk.green(previousFileSizes)}\n`);
  })
  .catch(err => {
    if (err && err.message) {
      console.log(err.message);
    }
    process.exit(1);
  });
