import Config from '@gem-mine/webpack-chain';
export interface EnvsParams {
  // builder 的根路径
  BUILDER_ROOT_PATH: string;
  ROOT_PATH: string;
  SRC_PATH: string;
  BUILD_PATH: string;
  BUILD_STATIC_PATH: string;
  CDN_BASE: string;
  // PUBLIC_PATH: string;
  ASSETS_URL: string;
  PUBLISH_ENV: string;
}

export enum ModeEnum {
  DEV = 'development',
  PROD = 'production',
  NONE = 'none'
}

export type ChainConfig = Config;

export interface PageProp {
	// 模块导出名称
	name: string;
	// 模块地址，相对app.config.js寻址
	module: string;
	// 模块地址，作用同module
	path: string;
	// 页面title
	title?: string;
  // 其他配置
  [props: string]: any
}

export interface FastConfig {
  // app 应用类型
  appType?: string;
  // 兼容配置
  page?: PageProp[];
  pages?: PageProp[];
  // 这是一个内部流转的字段
  _typeIsMicroApp?: boolean;
  // 该入口仅对builder 开放；
  chainConfig?: (config: ChainConfig, initConfig?: InitConfig) => ChainConfig;
  // 该入口仅对builder 开放, 用于统一配置调试服务相关的；
  serverConfig?: any;
  webpack?: {
    title: string;
    publicPath: string;
    analyze?: boolean;
    cache?: any;
    // 禁用软连接
    symlinks?: boolean;
    // 本地调试服务器配置
    devServer: any;
    // sourceMap
    devtool: string | boolean;

    // 以下配置对html 内容有效，优先级依次降低: 
    template?: any;
    templateContent?: any;
    runtime?: { heads?: string[]; bodies?: string[]; };
    // 该入口对 app开放
    configApi?: (config: ChainConfig, initConfig?: InitConfig) => ChainConfig;
    // 该入口对用户配置文件开放;
    config?: (config: any) => {};
  }
  // todo: 是否是微应用子应用
  isMicroApp?: boolean;
  // 禁用域名检测
  disableHostCheck?: boolean;
}

export interface InitConfig {
  env: ModeEnum;
  envs: EnvsParams;
  config: FastConfig;
}