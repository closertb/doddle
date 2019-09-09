import { defaultErrorHandler } from './utils';

export default class Instance {
  constructor(configs, handlers) {
    Object.assign(this, configs);
    this.handlers = handlers;
    this.fetch = this.fetch.bind(this);
    this.onError = this.onError.bind(this);
  }

  fetch(url, params, options) {
    this.url = url;
    this.options = options;
    this.params = params;
    this.data = {};
    return this.handlers(this)
      .then(() => this.data)
      .catch(this.onError);
  }

  onError(error) {
    if (this.errorHandle) {
      this.errorHandle(error);
    } else {
      defaultErrorHandler(error);
    }
    return {};
  }
}
