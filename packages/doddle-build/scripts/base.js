const webpack = require('webpack');
const chalk = require('chalk');
const fs = require('fs-extra');
const address = require('address');
const formatWebpackMessages = require('../config/formatWebpackMessages');
const configFactory = require('../config/webpack.config');
const clearConsole = require('../config/clearConsole');
const paths = require('../config/paths');

let isInteractive = process.stdout.isTTY;

let timeRecord = {
  start: 0,
  setStart() {
    this.start = Date.now();
  },
  getTime() {
    return ((Date.now() - this.start) / 1000).toFixed(2) + 's';
  },
};
function printInstructions(appName, serverConfig) {
  console.log();
  console.log(`You can now view ${chalk.bold(appName)} in the browser.`);
  console.log();

  console.log(
    `  ${chalk.bold('Local:')}            http://localhost:${
      serverConfig.port
    }/`
  );
  console.log(
    `  ${chalk.bold('On Your Network:')}  http://${address.ip()}:${
      serverConfig.port
    }/`
  );

  console.log();
  console.log('Note that the development build is not optimized.');
  console.log();
}

function createCompiler(config, serverConfig) {
  // "Compiler" is a low-level interface to Webpack.
  // It lets us listen to some events and provide our own custom messages.
  timeRecord.setStart();
  let compiler;
  // only run start with multi compile;
  let isFirstCompile = true;
  let isLocalCompile = !!serverConfig;
  try {
    compiler = webpack(config);
  } catch (err) {
    console.log(chalk.red('Failed to compile.'));
    console.log();
    console.log(err.message || err);
    console.log();
    process.exit(1);
  }
  // "invalid" event fires when you have changed a file, and Webpack is
  // recompiling a bundle. WebpackDevServer takes care to pause serving the
  // bundle, so if you refresh, it'll wait instead of serving the old one.
  // "invalid" is short for "bundle invalidated", it doesn't imply any errors.
  compiler.hooks.invalid.tap('invalid', () => {
    timeRecord.setStart();
    console.log('Compiling...');
  });

  // "done" event fires when Webpack has finished recompiling the bundle.
  // Whether or not you have warnings or errors, you will get this event.
  compiler.hooks.done.tap('done', async stats => {
    if (isInteractive) {
      // clearConsole();
    }

    // We have switched off the default Webpack output in WebpackDevServer
    // options so we are going to "massage" the warnings and errors and present
    // them in a readable focused way.
    // We only construct the warnings and errors for speed:
    // https://github.com/facebook/create-react-app/issues/4492#issuecomment-421959548
    const statsData = stats.toJson({
      all: false,
      warnings: true,
      errors: true,
    });

    const messages = formatWebpackMessages(statsData);
    const isSuccessful = !messages.errors.length && !messages.warnings.length;

    if (isLocalCompile && isSuccessful) {
      console.log(chalk.green('Compiled successfully!'));
      console.log();
    }
    if (isLocalCompile && isSuccessful && (isInteractive || isFirstCompile)) {
      timeRecord.end = Date.now();
      if (!isFirstCompile) {
        clearConsole();
      }
      console.log('the compiler time is:', chalk.cyan(timeRecord.getTime()));
      printInstructions('demo', serverConfig);
    }
    isFirstCompile = false;

    // If errors exist, only show errors.
    if (messages.errors.length) {
      // Only keep the first error. Others are often indicative
      // of the same problem, but confuse the reader with noise.
      if (messages.errors.length > 1) {
        messages.errors.length = 1;
      }
      console.log(chalk.red('Failed to compile.\n'));
      console.log(messages.errors.join('\n\n'));
      return;
    }

    // Show warnings if no errors were found.
    if (messages.warnings.length) {
      console.log();
      console.log('the compiler time is:', chalk.cyan(timeRecord.getTime()));
      console.log();
      console.log(chalk.yellow('Compiled with warnings.\n'));
      console.log(messages.warnings.join('\n\n'));

      // Teach some ESLint tricks.
      console.log(
        '\nSearch for the ' +
          chalk.underline(chalk.yellow('keywords')) +
          ' to learn more about each warning.'
      );
    }
  });
  return compiler;
}

// Create a webpack compiler that is configured with custom messages.
// Load proxy config
// const proxySetting = require(paths.appPackageJson).proxy;
// const proxyConfig = prepareProxy(proxySetting, paths.appPublic);
// Serve webpack assets generated by the compiler over a web server.
/* const serverConfig = createDevServerConfig(
  proxyConfig,
  urls.lanUrlForConfig
); */

// Create the production build and print the deployment instructions.
function build(nodeEnv, previousFileSizes) {
  const packageJson = fs.readJSONSync(paths.appPackageJson) || {};
  const config = configFactory(nodeEnv, packageJson.webpack);
  console.log('Creating an optimized production build...');
  // Remove all content but keep the directory so that
  // if you're in it, you don't end up in Trash
  fs.emptyDirSync(paths.output);
  console.log(`step 1: clean dist content ${chalk.red('success')}`);
  const compiler = createCompiler(config, false);
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      let messages;
      if (err) {
        if (!err.message) {
          return reject(err);
        }
        messages = formatWebpackMessages({
          errors: [err.message],
          warnings: [],
        });
      } else {
        messages = formatWebpackMessages(
          stats.toJson({ all: false, warnings: true, errors: false })
        );
      }
      if (messages.errors.length) {
        // Only keep the first error. Others are often indicative
        // of the same problem, but confuse the reader with noise.
        if (messages.errors.length > 1) {
          messages.errors.length = 1;
        }
        return reject(new Error(messages.errors.join('\n\n')));
      }
      /* if (
        process.env.CI &&
        (typeof process.env.CI !== 'string' ||
          process.env.CI.toLowerCase() !== 'false') &&
        messages.warnings.length
      ) {
        console.log(
          chalk.yellow(
            '\nTreating warnings as errors because process.env.CI = true.\n' +
              'Most CI servers set it automatically.\n'
          )
        );
        return reject(new Error(messages.warnings.join('\n\n')));
      } */

      return resolve({
        stats,
        previousFileSizes,
        warnings: messages.warnings,
      });
    });
  });
}
module.exports = {
  createCompiler,
  build,
};
