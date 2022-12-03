import * as path from 'path';
import { EnvsParams } from '../const/interface';
import Config from '@gem-mine/webpack-chain';

export default function ({
  webpackConfig,
  config,
  isDev,
  envs,
}: {
  webpackConfig: Config;
  envs: EnvsParams;
  config: any;
  isDev?: boolean;
}) {
  const { SRC_PATH, BUILD_PATH, ASSETS_URL, BUILDER_ROOT_PATH } = envs;

  // 全局日志打印配置
  webpackConfig.stats('errors-warnings');
  // 入口设置
  const { pages, symlinks = true, devtool, cache, useHash = false } = config;

  // 如果没有特殊的cache 配置，那就使用默认的系统缓存
  webpackConfig.cache(cache=== undefined ? {
    type: 'filesystem',
    idleTimeout: 2000,
    idleTimeoutAfterLargeChanges: 2000,
    maxAge: 86400000 * 7, // 一周有效
    store: 'pack',
    buildDependencies: {
      config: [__filename],
    }
  } : cache);

  // 兼容tnpm 搞得npm路径不规范问题
  webpackConfig.snapshot({
      // 标记 /node_modules/_xxx@xx@ 等包含版本号的路径为不可变路径
      // 避免 snapshot 额外消耗或引起不必要的 bug
      immutablePaths: [/(\/|\\)node_modules(\/|\\)\_@?.+@[a-zA-Z0-9.]+@/]
  });

  if (pages && pages.length) {
    pages.forEach(({ name, module: modulePath }) => {
    const jsEntryFile = path.join(SRC_PATH, modulePath);
    
    // entry 设定
    webpackConfig
      .entry(name || modulePath)
      .add(jsEntryFile)
      .end();
    });
  } else {
    const jsEntryFile = path.join(SRC_PATH, 'index');
    // entry 设定
    webpackConfig
      .entry('index')
      .add(jsEntryFile)
      .end();
  }

  // outPut 设置
  webpackConfig
    .output
    .path(BUILD_PATH)
    .pathinfo(false)
    .filename(useHash ? '[name].[contenthash:8].js' : '[name].js')
    // dev模式，在server中会对这个设置做一次修正
    .publicPath(ASSETS_URL)
    .chunkFilename(useHash ? '[name].chunk.[contenthash:8].js' : '[name].chunk.js')
    .end();

  // 自定义sourceMap，默认无输出
  if (isDev && devtool) {
    webpackConfig.devtool(devtool ? devtool : false);
  } else {
    webpackConfig.devtool(false);
  }

  if (!config.resolveLoader) {
    config.resolveLoader = {};
  }

  webpackConfig.resolve
    .symlinks(symlinks)
    .cacheWithContext(false)
    .end();

  webpackConfig.resolve
    .fallback
    .set('process', require.resolve('process/browser'))
    .set('buffer', require.resolve('buffer'))
    .set('crypto', require.resolve('crypto-browserify'))
    .set('stream', require.resolve('stream-browserify'))
    .set('zlib', require.resolve('browserify-zlib'))
    .set("events", require.resolve('events'))
    .set("os", require.resolve('os-browserify/browser'))
    // wap 编译有这个依赖
    .set('path', require.resolve('path-browserify'))
    // 新增vm, 主应用接灰度引擎会用
    .set('vm', require.resolve('vm-browserify'));

  webpackConfig.resolve.extensions
    .add('.tsx')
    .add('.ts')
    .add('.jsx')
    .add('.js')
    .add('.less')
    .add('.css');

  webpackConfig.resolve.alias
    .set('@/assets', path.join(SRC_PATH, '/assets'))
    .set('@/common', path.join(SRC_PATH, '/common'))
    .set('@/utils', path.join(SRC_PATH, '/utils'))
    .set('@/models', path.join(SRC_PATH, '/models'))
    .set('@/constants', path.join(SRC_PATH, '/constants'))
    .set('@/components', path.join(SRC_PATH, '/components'))
    .set('@/services', path.join(SRC_PATH, '/services'));
  
  webpackConfig.resolve.modules
    .add('node_modules')
    .add(path.join(envs.ROOT_PATH, "node_modules"))
    // 适配tnpm symlink 的奇葩模式
    .add(path.join(BUILDER_ROOT_PATH, "../../"))
    // 适配正常npm nodemodules目录 和 当前模块依赖的特殊版本依赖
    .add(path.join(BUILDER_ROOT_PATH, "node_modules"));

  return webpackConfig;
}
