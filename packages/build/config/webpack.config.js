const webpack = require('webpack');
const paths = require('./paths');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // css 代码打包成文件注入html
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin; // 打包体积
const ManifestPlugin = require('webpack-manifest-plugin');
const copyWebpackPlugin = require('copy-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin'); // css 代码压缩
const cssConfig = require('./cssConfig');

const {
  WARN_AFTER_BUNDLE_GZIP_SIZE,
  WARN_AFTER_CHUNK_GZIP_SIZE,
} = require('./limit');

const { isSameObject } = require('./utils');

function getSplitChunkConfig(useAntd) {
  return useAntd
    ? {
        antd: {
          test: /[\\/]node_modules[\\/](antd|@ant-design)[\\/]/,
          name: 'antd',
          minChunks: 1,
          chunks: 'all',
          priority: -10,
        },
        vendors: {
          //cacheGroups重写继承配置，设为false不继承
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          minChunks: 1,
          priority: -20,
        },
        index: {
          minChunks: 1,
          priority: -30,
          name: 'index',
          reuseExistingChunk: true,
        },
        default: false,
      }
    : {
        vendors: {
          //cacheGroups重写继承配置，设为false不继承
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          minChunks: 1,
          priority: -20,
        },
      };
}

function build(webpackEnv = 'development', extConfig) {
  const NODE_ENV = process.env.NODE_ENV;
  const DEPLOY_ENV = process.env.DEPLOY_ENV;
  const isServer = NODE_ENV === 'local';
  const isProduction = webpackEnv === 'production';
  const {
    title,
    copyPublic,
    entry = 'index',
    dist = 'dist',
    template = 'ejs',
    useAntd,
    useEslint,
    publicPath = './',
    useAnalyse,
    splitStyle = false,
    useMicroMode = false,
    disableSplitChunk = false,
  } = extConfig;

  // 正式环境会默认启用css 文件分离
  const isSplitStyle = useMicroMode || isProduction || splitStyle;

  const config = {
    entry: `./src/${entry}.js`,
    devtool: isProduction ? false : 'cheap-source-map',
    mode: isProduction ? 'production' : 'development',
    output: {
      filename: isServer ? 'bundle.js' : 'bundle.[contenthash:8].js',
      chunkFilename: isServer
        ? '[name].bundle.js'
        : '[name].bundle.[contenthash:8].js',
      // eslint-disable-next-line no-undef
      path: paths.setOutput(dist),
      publicPath: publicPath,
    },
    resolve: {
      alias: {
        configs: paths.resolveApp('src/configs'),
        components: paths.resolveApp('src/components'),
        services: paths.resolveApp('src/services'),
        pages: paths.resolveApp('src/pages'),
        models: paths.resolveApp('src/models'),
        services: paths.resolveApp('src/services'),
        utils: paths.resolveApp('src/utils'),
        '@': paths.resolveApp('src'),
      },
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /(node_modules|bower_components)/,
          loader: 'babel-loader?cacheDirectory=true',
          query: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: isServer
              ? [
                  [
                    require.resolve('babel-plugin-dva-hmr'),
                    { disableModel: true },
                  ],
                ]
              : [],
          },
        },
        {
          test: /\.(png|jpe?g|gif|ttf|svg)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 10000, // 配置了10以下上限，那么当超过这个上线时，loader实际上时使用的file-loader；
          },
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: "'" + NODE_ENV + "'",
          DEPLOY_ENV: "'" + DEPLOY_ENV + "'",
        },
      }),
      // Moment.js is an extremely popular library that bundles large locale files
      // by default due to how Webpack interprets its code. This is a practical
      // solution that requires the user to opt into importing specific locales.
      // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
      // I just leave zh-ch to my package
      // You can remove this if you don't use Moment.js:
      new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /zh-cn/),
    ],
  };

  if (!disableSplitChunk) {
    // 公共js单独打包
    config.optimization = {
      splitChunks: {
        minSize: 30000,
        chunks: 'all', // all, async, and initial, all means include all types of chunks
        name: false,
        cacheGroups: getSplitChunkConfig(!isServer && useAntd),
      },
    };
  }

  // 如果是ssr渲染，无需输出html文件
  if (template === 'ejs') {
    config.plugins.push(
      new HtmlWebpackPlugin({
        template: paths.appEjs,
        title,
      })
    );
  }
  // 如果需要拷贝Public文件夹内容
  if (copyPublic) {
    config.plugins.push(
      new copyWebpackPlugin([
        {
          from: paths.public, //打包的静态资源目录地址
          to: './', //打包到dist下面的public
        },
      ])
    );
  }
  if (isServer) {
    useEslint &&
      config.module.rules.unshift({
        test: /\.jsx?$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: paths.appSrc, // 指定检查的目录
        options: {
          // 这里的配置项参数将会被传递到 eslint 的 CLIEngine
          formatter: require('eslint-friendly-formatter'), // 指定错误报告的格式规范
          quiet: true, // 只上报error，不上报warning
        },
      });
    // 当开启了hot：true，会自动添加hotReplaceModule
    config.plugins.push(new webpack.HotModuleReplacementPlugin());
    config.plugins.push(new webpack.NamedModulesPlugin());
  } else {
    useAnalyse && config.plugins.push(new BundleAnalyzerPlugin());
  }
  // 添加样式处理loader
  config.module.rules.push(...cssConfig(isSplitStyle));
  if (isSplitStyle) {
    config.plugins.push(
      new MiniCssExtractPlugin({ filename: 'index.[contenthash:8].css' }),
      new OptimizeCSSAssetsPlugin({})
    );
  }

  useMicroMode &&
    config.plugins.push(
      new ManifestPlugin({
        filter: ({ isAsset, path }) => {
          // 只将js，css文件输入到Manifest.json
          return !isAsset && /[\.js,\.css]+$/.test(path);
        },
      })
    );
  if (isProduction) {
    config.performance = {
      maxAssetSize: WARN_AFTER_CHUNK_GZIP_SIZE,
      maxEntrypointSize: WARN_AFTER_BUNDLE_GZIP_SIZE,
    };
  }
  console.log('change');
  return config;
}

const initConfig = {
  title: 'doddle site',
  useAnalyse: false, // 是否开启打包体积分析
  useAntd: false, // 是否开启antd打包优化
  useEslint: false, // 编译前检查代码格式
  copyPublic: false, // 是否拷贝public文件夹内容
  publicResolvePath: './', // public 文件拷贝目录，默认dist根目录
  publicPath: './', // 文件绝对路径
};

const cache = {};

// 还未生效，还需要继续探索；
module.exports = function createWithCache(
  webpackEnv = 'development',
  extConfig = {}
) {
  const NODE_ENV = process.env.NODE_ENV;
  const withInitConfig = Object.assign({}, initConfig, extConfig);
  if (cache[NODE_ENV] && isSameObject(cache[NODE_ENV].last, withInitConfig)) {
    return cache[NODE_ENV].config;
  }
  cache[NODE_ENV] = {};
  cache[NODE_ENV].last = withInitConfig;
  cache[NODE_ENV].config = build(webpackEnv, withInitConfig);
  return cache[NODE_ENV].config;
};
