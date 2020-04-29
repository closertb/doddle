'use strict';
// Do this as the first thing so that any code reading it knows the right env.
process.env.NODE_ENV = 'local';
process.env.DEPLOY_ENV = 'local';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

const chalk = require('chalk');
const WebpackDevServer = require('webpack-dev-server');
const paths = require('../config/paths');
const configFactory = require('../config/webpack.config');
const mergeConfig = require('../config/mergeConfig');
const { createCompiler } = require('./base');
const { getArgs } = require('../config/utils');
const isInteractive = process.stdout.isTTY;

const args = getArgs();

const packageJson = require(paths.appPackageJson);

const serverConfig = Object.assign(
  {
    host: '0.0.0.0',
    port: '3000',
    hot: true,
    inline: true,
    open: false,
    quiet: true, // don't console the compile message
    overlay: true,
    stats: {
      colors: true,
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
    },
    // contentBase: [paths.setOutput(args.dist)],
    // watchContentBase: true,
  },
  args,
  { open: args.open === 'true' }
);

// Tools like Cloud9 rely on this.
const HOST = serverConfig.host;
const port = parseInt(serverConfig.port, 10);
// this is a bug when use node Api to launch an WebpackDevServer, the hot update did not work
// the problem mentioned at https://stackoverflow.com/questions/52818569/webpack-dev-server-hot-reload-doesnt-work-via-node-api
// the document mentiod at https://webpack.js.org/guides/hot-module-replacement/
const config = mergeConfig(
  configFactory(
    'development',
    Object.assign(
      {},
      args,
      { title: packageJson.title },
      packageJson.webpack || {}
    )
  )
);

WebpackDevServer.addDevServerEntrypoints(config, serverConfig);

const compiler = createCompiler(config, serverConfig);

const devServer = new WebpackDevServer(compiler, serverConfig);
// Launch WebpackDevServer.
devServer.listen(port, HOST, err => {
  if (err) {
    return console.log(err);
  }
  if (isInteractive) {
    // console.log('clear...');
    // clearConsole();
  }
  // We used to support resolving modules according to `NODE_PATH`.
  // This now has been deprecated in favor of jsconfig/tsconfig.json
  // This lets you use absolute paths in imports inside large monorepos:
  console.log(chalk.cyan('Starting the development server...\n'));
  // openBrowser(urls.localUrlForBrowser);
});

['SIGINT', 'SIGTERM'].forEach(function(sig) {
  process.on(sig, function() {
    devServer.close();
    process.exit();
  });
});
