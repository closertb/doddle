// @remove-on-eject-begin
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @remove-on-eject-end
'use strict';

const path = require('path');
const fs = require('fs');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const envPublicUrl = process.env.PUBLIC_URL;

const getPublicUrl = appPackageJson =>
  envPublicUrl || require(appPackageJson).homepage;

/* const moduleFileExtensions = [
  'web.mjs',
  'mjs',
  'web.js',
  'js',
  'web.ts',
  'ts',
  'web.tsx',
  'tsx',
  'json',
  'web.jsx',
  'jsx',
]; */

// config after eject: we're in ./config/
module.exports = {
  indexJs: resolveApp('src/index.js'),
  appEjs: resolveApp('index.ejs'),
  output: `${appDirectory}/dist`,
  appBuild: resolveApp('dist'),
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('src'),
  proxySetup: resolveApp('src/setupProxy.js'),
  publicUrl: getPublicUrl(resolveApp('package.json')),
};
