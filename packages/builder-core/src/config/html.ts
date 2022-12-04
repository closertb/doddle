import HtmlWebpackPlugin from 'html-webpack-plugin';
import Config from '@gem-mine/webpack-chain';
import * as fs from 'fs';
import * as path from 'path';
import { EnvsParams } from '../const/interface';

function getValueFromMultiType(val: string [] | string): string {
  return Array.isArray(val) ? val.join('') : val;
}

export default function ({
  webpackConfig,
  config,
  envs,
}: {
  webpackConfig: Config;
  config: any;
  isDev: boolean;
  envs: EnvsParams
  [prop: string]: any;
}) {
  const { runtime = {}, pages, template, title = 'My App', templateContent, isMicroApp = false } = config;
  const { SRC_PATH } = envs;
  const { heads = [], bodies = [], } = runtime;
  const htmlConfig = ({ title, heads, bodies, template }) => template ? { template } : {
    templateContent: templateContent || `
    <html>
      <head>
        <meta http-equiv="Cache-control" content="no-cache, no-store, must-revalidate">
        <meta http-equiv="Pragma" content="no-cache">
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <title>${title}</title>
        ${getValueFromMultiType(heads)}
      </head>
      <body>
        <div id="app"></div>
        ${getValueFromMultiType(bodies)}
      </body>
    </html>
  `,
  };
  
  // 多页面, 微应用子应用不存在多入口html
  if (pages && pages.length) {
    pages.forEach(({ title: pageTitle, name: pageName, module: moduePath, heads: _heads, bodies: _bodies }) => {
      const name = pageName || moduePath;
      webpackConfig
      .plugin(`html_${name}`)
      .use(HtmlWebpackPlugin, [{
        title: pageTitle || title,
        filename: `${name}.html`,
        chunks: [name],
        ...htmlConfig({
          title: pageTitle || title,
          heads: _heads || heads,
          bodies: _bodies || bodies,
          template: fs.existsSync(path.join(SRC_PATH, moduePath, 'index.html')) ? path.resolve(SRC_PATH, moduePath, 'index.html') : undefined,
        }),
      }])
      .end();
    })
  } else {
    // 默认单页面
    webpackConfig
    .plugin('html')
    .use(HtmlWebpackPlugin, [{
      title,
      filename: 'index.html',
      ...htmlConfig({ title, heads, bodies, template }),
    }])
    .end();
  }

  return webpackConfig;
}

