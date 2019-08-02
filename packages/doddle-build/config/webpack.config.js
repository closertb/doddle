const path = require('path');
const webpack = require('webpack');
const paths = require('./paths');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

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
          test: /\.js?$/,
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
          vendors: {
            test: /[\\/]node_modules[\\/]/,
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
    ],
    performance: {
      hints: isServer ? false : 'warning',
    },
  };
  if (isServer) {
    config.module.rules.push(
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader'],
      }
    );
    // 当开启了hot：true，会自动添加hotReplaceModule
    config.plugins.push(new webpack.NamedModulesPlugin());
  } else {
    config.module.rules.push(
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.less$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader'],
      }
    );
    config.plugins.push(
      new MiniCssExtractPlugin({ filename: 'index.[contenthash:8].css' })
    );
  }
  return config;
};
