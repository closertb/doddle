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
    const { query, errorHandle } = options;
    this.servers = options.servers || {};
    this.key = options.contentKey || '';
    this.before = options.beforeRequest || [];
    this.after = options.beforeResponse || [];
    this.queryParams = (query && query()) || {};
    this.errorHandle = errorHandle;
    this.create = this.create.bind(this);
    this.init();
  }

  static create(options) {
    return new Http(options);
  }

  create(service) {
    this.instance = new Instance(
      {
        domain: this.servers[service],
        key: this.key,
        queryParams: this.queryParams,
        errorHandle: this.errorHandle,
      },
      this.handlers
    );
    return requestMethods(this.instance.fetch);
  }

  init() {
    const defaultBeforeMidd = [addRequestDomain, addRequestQuery];
    const defaultAfterMidd = [responseStatusHandle, responseContentHandle];

    this.handlers = compose(
      defaultBeforeMidd
        .concat(this.before)
        .concat(fetchRequest)
        .concat(defaultAfterMidd)
        .concat(this.after)
    );
  }
}
