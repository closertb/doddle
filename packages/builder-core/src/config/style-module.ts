import MiniCssExtractPlugin from 'mini-css-extract-plugin'; // css 代码打包成文件注入html
// import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin'; // css 代码压缩
import Config from '@gem-mine/webpack-chain';
import path from 'path';
import { EnvsParams, } from '../const/interface';


const miniCssExtractLoader = MiniCssExtractPlugin.loader;

const lessModuleRegex = /\.module\.less$/;
const cssModuleRegex = /\.module\.css$/;

interface Opts {
  mfsu?: boolean;
  webpackConfig: Config;
  config: any;
  isDev?: boolean;
  extendsLoaders?: any[];
  disableCompress?: boolean;
  enableInlineStyle?: boolean;
  browserslist?: any;
  envs?: EnvsParams;
  // 不适用styleLoader导出；
  disableInline?: boolean;
  miniCSSExtractPluginPath?: string;
  miniCSSExtractPluginLoaderPath?: string;
}

interface CreateCSSRuleOpts extends Opts {
  lang: string;
  test: RegExp;
  excludeRex?: RegExp;
  loaderName: string;
  loader?: any;
  options?: any;
  cssOptions?: any;
}

export function createCSSRule({
  webpackConfig,
  config,
  lang,
  test,
  loader,
  options,
  cssOptions = {},
  excludeRex,
  disableInline,
  browserslist,
}: CreateCSSRuleOpts) {
  const rule = webpackConfig.module
    .rule(lang)
    .test(test);

  if (excludeRex) {
    rule.exclude
    .add(excludeRex)
    .end();
  }

  

  // 开发环境，采用样式标签直接插入
  if (!disableInline) {
    rule
      .use('style-loader')
      .loader(require.resolve('style-loader'))
      .options(config.styleLoader || {})
      .end();
  } else {
    rule
      .use('extract-css-loader')
      .loader(miniCssExtractLoader)
      .options({})
      .end();
  }

  const postcssOptions = {
    implementation: require('postcss'),
    postcssOptions: {
      plugins: [
        // https://github.com/luisrudge/postcss-flexbugs-fixes
        // require('postcss-flexbugs-fixes'),
        // https://github.com/csstools/postcss-preset-env
        require('postcss-preset-env')({
          // TODO: set browsers
          autoprefixer: {
            ...config.autoprefixer,
            overrideBrowserslist: browserslist,
          },
          // https://cssdb.org/
          stage: 3,
        }),
        ...(config.extraPostCSSPlugins ? config.extraPostCSSPlugins : []),
      ],
    },
  }

  rule
    .use('css-loader')
    .loader(require.resolve('css-loader'))
    .options(cssOptions)
    .end()
    .use('postcss-loader')
    .loader(require.resolve('postcss-loader'))
    .options(postcssOptions)
    .end();

  if (loader) {
    // console.log('----theme:', options);
    rule
      .use(loader)
      .loader(require.resolve(loader))
      .options(options || {});
  }
}

export default function ({
  config = {},
  webpackConfig,
  isDev,
  envs,
  // disableCompress,
  browserslist,
  extendsLoaders = [],
}: Opts) {
  const { ROOT_PATH } = envs;

  const { isMicroApp = false, cssOptions: cssOptionsConfig  = {}, themes } = config;
  const enableCssModules = !!config.cssmodules;
  const disableInline = config.enableInlineStyle ? false : !isDev || isMicroApp || config.disableInline;

  // 增加 importLoaders 默认配置；
  const cssOptions = Object.assign({ importLoaders: 1, }, cssOptionsConfig);
  const cssMoudleDefaultOptions = {
    modules: {
      mode: 'local',
      localIdentName: '[path][local]_[hash:base64:5]',
      localIdentContext: path.resolve(ROOT_PATH, "src/pages"),
  }
  }

  const lessOptions = {
    lessOptions: themes ? {
      modifyVars: themes,
      javascriptEnabled: true,
      strictMath: false,
    } : { javascriptEnabled: true },
  }
  // css
  createCSSRule({
    webpackConfig,
    config,
    lang: 'css',
    loaderName: 'css-loader',
    test: /\.css$/,
    excludeRex: enableCssModules ? cssModuleRegex,
    disableInline,
    browserslist,
    cssOptions,
  });

  if (enableCssModules) {
    createCSSRule({
      webpackConfig,
      config,
      lang: 'cssModule',
      loaderName: 'css-loader',
      test: cssModuleRegex,
      disableInline,
      browserslist,
      cssOptions: Object.assign(cssMoudleDefaultOptions, cssOptions),
    });
  }

  // console.log('theme:', config);
  createCSSRule({
    webpackConfig,
    config,
    lang: 'less',
    test: /\.less$/,
    excludeRex: lessModuleRegex,
    loaderName: 'less-loader',
    loader: require.resolve('less-loader'),
    disableInline,
    options: lessOptions,
    cssOptions,
    browserslist,
  });

  if (enableCssModules) {
    createCSSRule({
      webpackConfig,
      config,
      lang: 'lessMoudle',
      test: lessModuleRegex,
      loaderName: 'less-loader',
      loader: require.resolve('less-loader'),
      disableInline,
      options: lessOptions,
      cssOptions: Object.assign(cssMoudleDefaultOptions, cssOptions),
      browserslist,
    });    
  }


  // 便于其他loader扩展，比如saas
  extendsLoaders.forEach((loaderConfig) => {
    createCSSRule({
      webpackConfig,
      config,
      browserslist,
      ...loaderConfig,
    });
  })

  // css 分离相关的样式插件安装
  if (disableInline) {
    const hash = config.useHash ? '.[contenthash:8]' : '';
    // only csr generator css files
    webpackConfig
      .plugin('extract-css')
      .use(
        MiniCssExtractPlugin,
        [
          {
            filename: `[name]${hash}.css`,
            chunkFilename: `[name]${hash}.chunk.css`,
            ignoreOrder: true,
          },
        ],
      )
      .end();
  }
}
