import TerserPlugin from 'terser-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import Config from '@gem-mine/webpack-chain';

export function OptimizationConfig({
  webpackConfig,
}: {
  webpackConfig: Config
}) {
  webpackConfig
  .optimization
    .minimizer('disableComment')
    .use(TerserPlugin, [{
      parallel: true,
      extractComments: false
    }])
    .end()
    .minimizer('disableCssComment')
    .use(CssMinimizerPlugin, [])
    .end();;
  return webpackConfig;
};