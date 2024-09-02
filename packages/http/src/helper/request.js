import { defaultErrorHandler, resFormat, requestMethods } from './utils';


export default class Fetcher {
  errorHandle = defaultErrorHandler;
  /**
   * fetch扩展入口
   * @param {*} req 来源于saas-fetch
   */
  async request(req) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { typeName, url, gateway = '', errorHandle = defaultErrorHandler, format = resFormat, method = 'post', param = {}, ...options } = req;
    this.errorHandle = errorHandle;
    const _url = url.startsWith('http') ? url : `${gateway}${url}`;
    const _request = requestMethods[method.toLocaleLowerCase()] || requestMethods.post;
    let status = 200;
    const res = await _request(_url, param, options).then((response) => {
      status = response.status;
      if (response.ok && response.status < 400) {
        return response.json();
      }
      return Promise.reject({ message: '网络错误, 请稍后重试' });
    }).catch(error => {
      return this.onError(error, status);
    });

    return format({
      status,
      ...res
    });
  }

  onError(error, status) {

    return this.errorHandle ?
      this.errorHandle(error) :
      Promise.reject({
        success: false,
        error,
        status,
      });
  }
}
