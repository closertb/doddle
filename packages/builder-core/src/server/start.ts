import WebpackDevServer from 'webpack-dev-server';
import openPage from 'open';
import * as qs from 'qs';

export const getStartParam = async (serverConfig) => {
  const { port, https, host = 'localhost', path, query } = serverConfig || {};
  const querystring = query ? qs.stringify(query) : '';
  const entryUrl = `//${host}:${port}`;

  // 设置通用的url；
  let url = `http${https ? 's' : ''}:${entryUrl}`;
  if (path) {
    url += path.startsWith('/') ? `${path}` : `/${path}`;
  }

  if (querystring) {
    url += `?${querystring}`;
  }


  return {
    url,
    port,
    https,
  };
};

export function startServer(compiler, serverConfig) {
  let startParam: any;
  // 默认打开
  const { open = true } = serverConfig;
  const _start = async () => {
    startParam = await getStartParam(serverConfig);
    
    // const compiler = webpack(config);
    // 删除webpack5 不兼容的键；
    delete serverConfig.path;
    delete serverConfig.query;
    delete serverConfig.stats;
    delete serverConfig.disableHostCheck;
    // 禁用系统自带的open, 防止多次打开
    serverConfig.open = false;
  
    const server = new WebpackDevServer(serverConfig, compiler);

    await server.start();
    if (!(process.env.REBUILD === 'rebuild' && process.env.LAST_URL === startParam.url)) {
      open && openPage(startParam.url);
    }
  };

  
  return {
    async start() {
      await _start();
    },
  };
}
