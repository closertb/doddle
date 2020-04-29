const fs = require('fs-extra');
const paths = require('../config/paths');

module.exports = config => {
  let privateConfig;

  // 获取项目自定义配置；
  if (fs.existsSync(paths.webpackConfig)) {
    const privateFun = require(paths.webpackConfig);
    if (typeof privateFun !== 'function') {
      console.warn('webpack-config.js should output a function');
    } else {
      privateConfig = privateFun;
    }
  }

  if (privateConfig) {
    let selfConfig = privateConfig(config);
    if (typeof selfConfig === 'object') {
      return selfConfig;
    }
    console.warn('webpack-config.js should return the config object');
  }
  return config;
};
