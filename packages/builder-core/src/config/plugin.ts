import Config from '@gem-mine/webpack-chain';
import ProgressBarPlugin from 'progress-bar-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import ReactRefresh from '@pmmmwh/react-refresh-webpack-plugin'
import { ContextReplacementPlugin, DefinePlugin, ProvidePlugin } from 'webpack';
import { genProcessEnvs } from '../const/utils';
import { EnvsParams } from '../const/interface';
import path from 'path';

// DefinePlugin
export default function ({
  webpackConfig,
  config,
  envs,
  isDev,
}: {
  webpackConfig: Config;
  config: Record<string, any>;
  envs: EnvsParams;
  isDev: boolean;
}) {
  const { ROOT_PATH, BUILD_PATH, PUBLISH_ENV } = envs;
  // 编译进度，仅本地构建时生效
  webpackConfig
    .when(isDev, (_config) => {
      _config
        .plugin('progress')
        .use(ProgressBarPlugin);;
    });

  // 编译结果分享，仅本地构建时生效
  webpackConfig.when(!PUBLISH_ENV && config.analyze, (_config) => {
    _config.plugin('analyse').use(BundleAnalyzerPlugin);
  });

  // 自动集成 fastRefresh 更新
  webpackConfig.when(isDev && config.fastRefresh, (_config) => {
    _config.plugin('fastRefresh').use(ReactRefresh, []);
  });

  // 清理构建产物
  // webpackConfig
  //   .plugin('clean')
  //   .use(CleanWebpackPlugin, [[BUILD_PATH]]);

  // 处理 webpack5 不再默认输出process 变量
  webpackConfig
    .plugin('provide')
    .use(ProvidePlugin, [{
      process: require.resolve('process/browser'),
      Buffer: ['buffer', 'Buffer'],
    }]);

  // 自定义环境变量输出
  webpackConfig
    .plugin('define')
    .use(DefinePlugin, [genProcessEnvs({
      define: Object.assign({ PUBLISH_ENV, }, config.defineEnv || {}),
    })]);

  // 产出 moment 中文处理
  webpackConfig.when(!config.ignoreMomentLocale, (_config) => {
    _config.plugin('moment').use(ContextReplacementPlugin, [/moment[/\\]locale$/, /zh-cn/]);
  });

  // 产出 public 文件夹处理
  webpackConfig.when(config.usePublic, (_config) => {
    _config
      .plugin('copy')
      .use(CopyWebpackPlugin, [{
        patterns: [{
          from: path.resolve(ROOT_PATH, './public'), // 打包的静态资源目录地址
          to: BUILD_PATH,
        }],
      }]);
  });
}
