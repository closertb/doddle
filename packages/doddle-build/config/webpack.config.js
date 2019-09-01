const path = require('path');
const webpack = require('webpack');
const paths = require('./paths');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // css 代码打包成文件注入html
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin; // 打包体积
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin'); // css 代码压缩

const {
  WARN_AFTER_BUNDLE_GZIP_SIZE,
  WARN_AFTER_CHUNK_GZIP_SIZE,
} = require('./limit');

const { isSameObject } = require('./utils');
/* // Resolve file paths in the same order as webpack
const resolveModule = (resolveFn, filePath) => {
  const extension = moduleFileExtensions.find(extension =>
    fs.existsSync(resolveFn(`${filePath}.${extension}`))
  );

  if (extension) {
    return resolveFn(`${filePath}.${extension}`);
  }

  return resolveFn(`${filePath}.js`);
}; */
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
  const isServer = NODE_ENV === 'local';
  const isProduction = webpackEnv === 'production';
  const openAnalyse = extConfig.useAnalyse || false;
  const serverPath = extConfig.publicPath || './';
  const useEslint = extConfig.useEslint || false;
  const title = extConfig.title;

  const config = {
    entry: './src/index.js',
    devtool: isProduction ? false : 'cheap-source-map',
    mode: isProduction ? 'production' : 'development',
    output: {
      filename: isServer ? 'bundle.js' : 'bundle.[contenthash:8].js',
      chunkFilename: isServer
        ? '[name].bundle.js'
        : '[name].bundle.[contenthash:8].js',
      // eslint-disable-next-line no-undef
      path: path.resolve(__dirname, paths.output),
      publicPath: isProduction ? serverPath : './',
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /(node_modules|bower_components)/,
          loader: 'babel-loader?cacheDirectory=true',
          query: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
        {
          test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 10000, // 配置了10以下上限，那么当超过这个上线时，loader实际上时使用的file-loader；
          },
        },
      ],
    },
    // 公共js单独打包
    optimization: {
      splitChunks: {
        minSize: 30000,
        chunks: 'all', // all, async, and initial, all means include all types of chunks
        name: false,
        cacheGroups: getSplitChunkConfig(!isServer && extConfig.useAntd),
      },
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: paths.appEjs,
        title,
      }),
      new webpack.DefinePlugin({
        'process.env': { NODE_ENV: "'" + NODE_ENV + "'" },
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
  if (isServer) {
    config.module.rules.push(
      {
        // 对于纯css文件，由于面向的是第三方库，无需开启module
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              // minimize: true,
              modules: true,
              localIdentName: '[local]_[contenthash:base64:5]',
            },
          },
          'sass-loader',
        ],
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              // minimize: true,
              modules: true,
              context: path.resolve(__dirname, 'src'),
              localIdentName: '[local]_[contenthash:base64:5]',
            },
          },
          {
            loader: 'less-loader',
            options: {
              // https://github.com/ant-design/ant-motion/issues/44
              javascriptEnabled: true,
            },
          },
        ],
      }
    );
    useEslint &&
      config.rules.unshift({
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
    config.plugins.push(new webpack.NamedModulesPlugin());
  } else {
    config.module.rules.push(
      {
        // 对于纯css文件，由于面向的是第三方库，无需开启module
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              // minimize: true,
              modules: true,
            },
          },
          'sass-loader',
        ],
      },
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: true,
            },
          },
          {
            loader: 'less-loader',
            options: {
              // https://github.com/ant-design/ant-motion/issues/44
              javascriptEnabled: true,
            },
          },
        ],
      }
    );
    config.plugins.push(
      new MiniCssExtractPlugin({ filename: 'index.[contenthash:8].css' }),
      new OptimizeCSSAssetsPlugin({})
    );
    openAnalyse && config.plugins.push(new BundleAnalyzerPlugin());
  }
  if (isProduction) {
    config.performance = {
      maxAssetSize: WARN_AFTER_CHUNK_GZIP_SIZE,
      maxEntrypointSize: WARN_AFTER_BUNDLE_GZIP_SIZE,
    };
  }
  return config;
}

const initConfig = {
  useAnalyse: false, // 是否开启打包体积分析
  useAntd: false, // 是否开启antd打包优化
  useEslint: false, // 编译前检查代码格式
  publicPath: './',
};

const cache = {};

// 还未生效，还需要继续探索；
module.exports = function createWithCache(
  webpackEnv = 'development',
  extConfig = initConfig
) {
  const NODE_ENV = process.env.NODE_ENV;
  if (cache[NODE_ENV] && isSameObject(cache[NODE_ENV].last, extConfig)) {
    return cache[NODE_ENV].config;
  }
  cache[NODE_ENV] = {};
  cache[NODE_ENV].last = extConfig;
  cache[NODE_ENV].config = build(webpackEnv, extConfig);
  return cache[NODE_ENV].config;
};
