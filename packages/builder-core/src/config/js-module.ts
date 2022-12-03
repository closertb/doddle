import path from 'path';
import { ChainConfig, EnvsParams } from '../const/interface';
const { resolve } = require;


// js 文件处理
export default function ({
  envs,
  isDev,
  config,
  webpackConfig,
}: {
  isDev: boolean;
  envs: EnvsParams;
  config: Record<string, any>;
  webpackConfig: ChainConfig;
}) {
  const { SRC_PATH } = envs;
  // webpackConfig.externals
  // 构建结果，文件是否带hash数字;
  // const isHash = !isDev && config.hash;

  const babelPlugins = [
    [resolve('@babel/plugin-proposal-object-rest-spread'), {
        loose: true
    }],
    [
        resolve('@babel/plugin-proposal-decorators'),
        {
            legacy: true,
        },
    ],
    resolve('@babel/plugin-transform-runtime'),
    [resolve('@babel/plugin-proposal-class-properties'), {
        loose: true
    }],
    [resolve('@babel/plugin-proposal-private-methods'), {
        loose: true
    }],
    resolve('@babel/plugin-proposal-function-bind'),
    resolve('@babel/plugin-proposal-export-default-from'),
    resolve('@babel/plugin-proposal-export-namespace-from'),
    resolve('@babel/plugin-syntax-dynamic-import'),
  ];

  // 增加fastRefresh 插件
  if (isDev && config.fastRefresh) {
    babelPlugins.push(resolve('react-refresh/babel'));
  }

  webpackConfig.module
    .rule('js')
    .test(/\.jsx?$/)
    .exclude
    .add(/node_modules/)
    .end()
    // .include
    // .add(path.resolve(SRC_PATH))
    // .end()
    .use('babel-loader')
    .loader(resolve('babel-loader'))
    .options({
      compact: false,
      cacheCompression: false,
      cacheDirectory: true,
      presets: [
        resolve('@babel/preset-react'),
        [
          resolve('@babel/preset-env'),
          {
            useBuiltIns: 'entry', // 按需引入 polyfill // @sun 按需引入是usage吧？
            corejs: 3,
            modules: false,
            targets: {
              browsers: [
                'last 2 versions',
                'Firefox ESR',
                '> 1%',
                'ie >= 8',
                'iOS >= 8',
                'Android >= 4',
              ],
            },
          },
        ],
      ],
      plugins: babelPlugins,
    });

  webpackConfig.module
    .rule('ts')
    .test(/\.(ts|tsx)$/)
    .exclude.add(/node_modules/).end()
    // .include
    // .add(path.resolve(SRC_PATH))
    // .end()
    .use('babel-loader')
    .loader(resolve('babel-loader'))
    .options({
        presets: [
          resolve('@babel/preset-react')],
        plugins: [],
    })
    .end()
    .use('ts-loader')
    .loader(resolve('ts-loader'))
    .options({
      transpileOnly: true,
    });
}
