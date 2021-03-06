import {
  addRequestDomain,
  addRequestQuery,
  fetchRequest,
  responseStatusHandle,
  responseContentHandle,
} from './middlewares';
import compose, { requestMethods } from './utils';
import Instance from './instance';

export default class Http {
  constructor(options) {
    const {
      bodyParam = {}, // fetch通用设置
      query = () => ({}),
      servers = {},
      contentKey = '',
      beforeRequest = [],
      beforeResponse = [],
      errorHandle,
    } = options;
    this.servers = servers;
    this.key = contentKey;
    this.before = beforeRequest;
    this.after = beforeResponse;
    this.query = query;
    this.errorHandle = errorHandle;
    this.bodyParam = bodyParam;
    this.create = this.create.bind(this);
    this._middlewareInit();
  }

  // 静态方法, 语义化实例构造
  static create(options) {
    return new Http(options);
  }

  // 请求实例构造方法
  create(service) {
    this._instance = new Instance({
      domain: this.servers[service],
      key: this.key,
      query: this.query,
      bodyParam: this.bodyParam,
      errorHandle: this.errorHandle,
      handlers: this._handlers,
    });
    return requestMethods(this._instance.fetch);
  }

  // 中间件扩展， like Koa
  use(fn, order, isReplace = 0) {
    if (typeof fn !== 'function')
      throw new TypeError('middleware must be a function!');
    let _order = order || 0;
    // 插入位置不对，自动纠正
    if (typeof _order !== 'number' || _order > this._middleWares.length) {
      _order = this._middleWares.length;
    }
    this._middleWares.splice(order || this._middleWares.length, isReplace, fn);
    this._middlewareInit();
  }
  // 中间件初始化方法，内部调用
  _middlewareInit() {
    const defaultBeforeMidd = [addRequestDomain, addRequestQuery];
    const defaultAfterMidd = [responseStatusHandle, responseContentHandle];

    this._middleWares =
      this._middleWares ||
      defaultBeforeMidd
        .concat(this.before)
        .concat(fetchRequest)
        .concat(defaultAfterMidd)
        .concat(this.after);
    this._handlers = compose(this._middleWares);
  }
}

export const middleWares = {
  addRequestDomain,
  addRequestQuery,
  fetchRequest,
  responseStatusHandle,
  responseContentHandle,
};
