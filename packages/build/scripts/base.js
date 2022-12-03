const { Bundler: WebpackBundler } = require('@doddle/builder-core');
const fs = require('fs-extra');
const { getArgs } = require('../config/utils');
const paths = require('../config/paths');
const chalk = require('chalk');

process.on('unhandledRejection', err => {
  console.log(chalk.red('--------进程运行错误----------'));  
  throw err;
});

async function createCompiler(envs = {}) {
  const args = getArgs();
  const packageJson = fs.readJSONSync(paths.appPackageJson) || {};
  const appConfig = require(paths.appConfig);

  console.log('Creating an optimized production build...', appConfig);

  const outputPath = args.dist || 'dist';
  fs.emptyDirSync(paths.setOutput(outputPath));

  console.log('envs:', Object.assign(paths.envs, envs));
  
  const bundler = new WebpackBundler({
    envs: Object.assign(paths.envs, envs),
  });

  // 自定义 config 实例化
  await bundler.getConfig(appConfig);

  return bundler;
}

module.exports = {
  createCompiler
};
