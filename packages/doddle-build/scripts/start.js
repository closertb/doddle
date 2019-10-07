'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.NODE_ENV = 'local';

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
const { createCompiler } = require('./base');
const ArgStart = 2;
const isInteractive = process.stdout.isTTY;

const args = process.argv.slice(ArgStart).reduce((pre, cur, index, arr) => {
  if (~cur.indexOf('--')) {
    pre[cur.replace(/-/g, '')] = arr[index + 1];
  }
  return pre;
}, {});

// We require that you explicitly set browsers and do not fall back to
// browserslist defaults.
// const { checkBrowsers } = require('react-dev-utils/browsersHelper');
const packageJson = require(paths.appPackageJson);
const config = configFactory(
  'development',
  Object.assign({}, { title: packageJson.title }, packageJson.webpack || {})
);

const serverConfig = Object.assign(
  {
    host: 'localhost',
    port: '3000',
    hot: true,
    inline: true,
    open: false,
    quiet: true, // don't console the compile message
    overlay: true,
    stats: {
      colors: true,
    },
    contentBase: [paths.output],
    watchContentBase: true,
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
