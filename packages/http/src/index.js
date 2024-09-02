/*
* 适配底层请求库的中间件，在整个中间件模型的最内层，最接近发起请求的一层
* 中间件可以添加多个
* 默认配置模板，非强制
*/

import Fetcher from './helper/request';

const fetch = new Fetcher();

export default async function adapterMiddleware(ctx, next) {
  const { useCache = false } = ctx.req;
  // config: 中间件私有配置对象，自行选择使用
  if (useCache && ctx.res && ctx.res.success) {
    await next();
    return;
  }

  const res = await fetch.request(ctx.req);

  ctx.res = res;

  await next();
}

export function helper(request, typeName) {
  return {
    get: (url, param, options = {}) => request({
      url,
      typeName,
      method: 'get',
      param,
      ...options,
    }),
    post: (url, param, options = {}) => request({
      url,
      method: 'post',
      param,
      typeName,
      type: 'application/json',
      ...options,
    }),
    put: (url, param, options = {}) => request({
      url,
      method: 'put',
      param,
      typeName,
      type: 'application/json',
      ...options,
    }),
    delete: (url, param, options = {}) => request({
      url,
      method: 'delete',
      param,
      typeName,
      type: 'application/json',
      ...options,
    }),
  };
}

export { CacheMiddleware } from './middlewares/http-cache';

export { CacheHelper } from './helper/cacheHelper';
