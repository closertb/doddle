import { defaultErrorHandler } from './utils';

export default class Instance {
  constructor({ handlers, errorHandle, bodyParam, ...configs }) {
    this.configs = configs;
    this.errorHandle = errorHandle;
    this.handlers = handlers;
    this.bodyParam = bodyParam;
    this.fetch = this.fetch.bind(this);
    this.onError = this.onError.bind(this);
  }

  /**
   * fetch扩展入口
   * @param {*} url：请求地址，不带domain，中间件中处理
   * @param {*} params：fetch的第二个参数， { body, headers, mode, credentials, method这些 }
   * @param {*} options
   */
  fetch(url, params, options) {
    const configs = this.configs;
    const { headers = {} } = this.bodyParam;
    const {
      type,
      ignoreQuery,
      headers: headerOption = {},
      ...others
    } = options; // others 有可能包含一些mode，credential的设置
    const bodyParams = Object.assign({}, this.bodyParam, params, others); // 扩展初始构造参数中的bodyParam配置，比如mode设置
    bodyParams.headers = Object.assign(
      {},
      headers,
      bodyParams.headers,
      headerOption
    );
    const ctx = Object.assign({}, configs, {
      url,
      options,
      params: bodyParams,
    });
    return this.handlers(ctx)
      .then(() => ctx.data)
      .catch(this.onError);
  }

  onError(error) {
    if (this.errorHandle) {
      this.errorHandle(error);
    } else {
      defaultErrorHandler(error);
    }
    return Promise.reject({});
  }
}
