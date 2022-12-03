'use strict';

const path = require('path');
const fs = require('fs');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const envPublicUrl = process.env.PUBLIC_URL;

const getPublicUrl = appPackageJson =>
  envPublicUrl || require(appPackageJson).homepage;

const envs = {
  ROOT_PATH: appDirectory,
  SRC_PATH: resolveApp('src'),
  BUILD_PATH: resolveApp('dist'),
  BUILDER_ROOT_PATH: path.resolve('../'),
  BUILD_STATIC_PATH: resolveApp('dist', 'assets'),
  PUBLISH_ENV: 'local',
};

module.exports = {
  resolveApp,
  envs,
  indexJs: resolveApp('src/index.js'),
  appEjs: resolveApp('index.ejs'),
  output: resolveApp('dist'),
  public: resolveApp('public'),
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('src'),
  serverConfig: resolveApp('server.config.js'),
  publicUrl: getPublicUrl(resolveApp('package.json')),
  appConfig: resolveApp('webpack.config.js'),
  setOutput: (dist = 'dist') => resolveApp(dist),
};
