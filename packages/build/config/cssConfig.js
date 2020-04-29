const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // css 代码打包成文件注入html
const path = require('path');

module.exports = isSplit => {
  const finalLoader = isSplit ? MiniCssExtractPlugin.loader : 'style-loader';

  return [
    {
      // 对于纯css文件，由于面向的是第三方库，无需开启module
      test: /\.css$/,
      use: [finalLoader, 'css-loader'],
    },
    {
      test: /\.scss$/,
      use: [
        finalLoader,
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
        finalLoader,
        {
          loader: 'css-loader',
          options: {
            // minimize: true,
            modules: true,
            // 正式打包，这里是被注销了的
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
    },
  ];
};
