const path = require('path');
const webpack = require('webpack');
const paths = require('./paths');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const {
  WARN_AFTER_BUNDLE_GZIP_SIZE,
  WARN_AFTER_CHUNK_GZIP_SIZE,
} = require('./limit');
const serverPath = 'http://127.0.0.1';

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

module.exports = function(webpackEnv = 'development') {
  const NODE_ENV = process.env.NODE_ENV;
  const isServer = NODE_ENV === 'local';
  const isProduction = webpackEnv === 'production';

  const config = {
    entry: './src/index.js',
    devtool: isProduction ? false : 'cheap-source-map',
    mode: isProduction ? 'production' : 'development',
    output: {
      filename: isServer ? 'bundle.js' : 'bundle.[contenthash:8].js',
      chunkFilename: isServer
        ? 'async.bundle.js'
        : 'async.bundle.[contenthash:8].js',
      // eslint-disable-next-line no-undef
      path: path.resolve(__dirname, paths.output),
      publicPath: isProduction ? serverPath : '/',
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          loader: 'eslint-loader',
          enforce: 'pre',
          include: paths.appSrc, // 指定检查的目录
          options: {
            // 这里的配置项参数将会被传递到 eslint 的 CLIEngine
            formatter: require('eslint-friendly-formatter'), // 指定错误报告的格式规范
            quiet: true, // 只上报error，不上报warning
          },
        },
        {
          test: /\.jsx?$/,
          exclude: /(node_modules|bower_components)/,
          loader: 'babel-loader',
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
        cacheGroups: {
          antd: {
            test: /[\\/]node_modules[\\/](antd|antd-doddle)[\\/]/,
            name: 'antd',
            chunks: 'all',
          },
        },
      },
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: paths.appEjs,
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
              localIdentName: '[local]_[hash:base64:5]',
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
              localIdentName: '[local]_[hash:base64:5]',
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
              localIdentName: '[local]_[hash:base64:5]',
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
              // minimize: true,
              modules: true,
              localIdentName: '[local]_[hash:base64:5]',
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
      new MiniCssExtractPlugin({ filename: 'index.[contenthash:8].css' })
    );
  }
  if (isProduction) {
    config.performance = {
      maxAssetSize: WARN_AFTER_CHUNK_GZIP_SIZE,
      maxEntrypointSize: WARN_AFTER_BUNDLE_GZIP_SIZE,
    };
  }
  return config;
};
