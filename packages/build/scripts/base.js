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
  console.log('args:', args);
  
  // console.log('Creating an optimized production build...', appConfig);

  const outputPath = args.dist || 'dist';
  fs.emptyDirSync(paths.setOutput(outputPath));

  // console.log('envs:', Object.assign(paths.envs, envs));
  
  const bundler = new WebpackBundler({
    envs: Object.assign(paths.envs, envs),
  });

  const { webpack, ...others } = appConfig;

  const appConfigs = Array.isArray(webpack) ? webpack : [webpack];

  // 按多配置依次序列化
  for (const config of appConfigs) {
    // 指定了要编译的端;
    if (args.runby) {
      console.log('dg:', config.type, args.runby);
      
      // 只生成制定端的配置
      if (config.type === args.runby) {
        await bundler.getConfig(Object.assign(others, config));
      }
    } else {
    // 实例化所有端配置
    await bundler.getConfig(Object.assign(others, config));
    }
  }

  return bundler;
}

module.exports = {
  createCompiler
};
