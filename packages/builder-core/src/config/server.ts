import Config from '@gem-mine/webpack-chain';
// import { EnvsParams } from './utils';
import * as portfinder from 'portfinder';

export const fixStartParam = async (config: Config) => {
  const serverConfig = config.devServer;

  let port = serverConfig.get('port');
  if (!port) {
    port = await portfinder.getPortPromise({
      port: 8000,
      stopPort: 9000,
    });
  }

  const host = serverConfig.get('host');

  const entryUrl = `//${host}:${port}`;

  return {
    port,
    publicPath: `${entryUrl}/`
  };
};

export default async function ({
  webpackConfig,
  config,
  isDev,
  // envs,
}: {
  webpackConfig: Config;
  config: any;
  // envs: EnvsParams;
  isDev: boolean;
}) {
  // const { BUILD_PATH } = envs;
  if (!isDev) {
    return webpackConfig;
  }
  // devserver 设定
  webpackConfig
    .devServer
    .host('localhost')
    .port(8000)
    .hot(true)
    .https(false)
    .compress(false)
    .historyApiFallback(true)
    // .writeToDisk(true)
    // .static(false)
    .headers({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    })
    .client
      // @ts-ignore
      .set('progress', true)
      .end()
    .end();

  // 合并通用设置中的 devserver；
  if (config.devServer) {
    webpackConfig.merge({
      devServer: config.devServer,
    });
  }
  const fixParams = await fixStartParam(webpackConfig)
  const { publicPath, port } = fixParams;

  webpackConfig.devServer.port(port);
  // disableHostCheck 前置设置;
  if (config.disableHostCheck || config.devServer?.disableHostCheck) {
    webpackConfig.devServer.host('0.0.0.0');
    webpackConfig.devServer.set('allowedHosts', 'all');
  }
  webpackConfig.output.publicPath(publicPath);
  return webpackConfig;
}
