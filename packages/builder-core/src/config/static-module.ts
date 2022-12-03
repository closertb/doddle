const { resolve } = require;

// js 文件处理
export default function ({
  webpackConfig,
  staticDir = 'static',
}) {

  // prettier-ignore
  webpackConfig
    .module
    .rule('asset')
    .test(/\.(png|jpe?g|gif|webp|ico|eot|woff|woff2|ttf)(\?.*)?$/)
    .type('asset/resource')
    .generator({
      filename: `${staticDir}/[hash][ext]`,
    });

  // inline svg 处理
  webpackConfig.module
    .rule('svg')
    .test(/\.(svg)(\?.*)?$/)
    .oneOf('svgr')
      .issuer(/\.[jt]sx?$/)
      .use('svgr')
        .loader(resolve('@svgr/webpack'))
        .end()
    .end()
    .oneOf('inline')
      .type('asset/inline')
      .parser({
          dataUrlCondition: {
              maxSize: 200
          }
      })
    .end()
}
