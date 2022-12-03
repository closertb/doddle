import Config from '@gem-mine/webpack-chain';
import { EnvsParams, ModeEnum } from '../const/interface';
import BaseConfig from './base';
import JsModuleConfig from './js-module';
import StaticModuleConfig from './static-module';
import { OptimizationConfig } from './optimization';
import StyleModuleConfig from './style-module';
import PluginConfig from './plugin';
import HtmlConfig from './html';
import Server from './server';

export async function genConfig({ config, env, envs }:
{
  config: any;
  env: ModeEnum;
  envs: EnvsParams;
  [prop: string]: any;
}) {
  const webpackConfig = new Config();
  const isDev = env === ModeEnum.DEV;
  // 做一次属性值计算，避免后面二次判断；
  config.useHash = !isDev && config.useHash;

  webpackConfig.mode(env);

  BaseConfig({ webpackConfig, config, isDev, envs });
  // js 模块处理
  JsModuleConfig({ webpackConfig, envs, isDev, config });
  // css 样式模块处理
  StyleModuleConfig({ config, webpackConfig, isDev, envs });
  // 静态资源 文件模块处理
  StaticModuleConfig({ webpackConfig });
  // 公共插件处理
  PluginConfig({ config, webpackConfig, isDev, envs });
  // 打包优化配置
  OptimizationConfig({ webpackConfig });
  // html 模板文件
  HtmlConfig({ webpackConfig, isDev, envs, config });
  // webpack Server相关
  await Server({ config, webpackConfig, isDev });
  return webpackConfig;
}

export { startServer, getStartParam } from '../server/start';
