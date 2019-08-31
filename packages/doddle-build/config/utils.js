function isSameObject(last, current) {
  if (!last) {
    // 首次为空
    return false;
  }
  return Object.keys(current).every(key => current[key] === last[key]);
}

/* const initConfig = {
  useAnalyse: false, // 是否开启打包体积分析
  useAntd: false, // 是否开启antd打包优化
  useEslint: false, // 编译前检查代码格式
  publicPath: './',
}; */

// console.log('res:', isSameObject(initConfig, initConfig));
module.exports = {
  isSameObject,
};
