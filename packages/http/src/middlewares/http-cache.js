
import { Cache } from '../helper/storage';

export const CacheMiddleware = {
  name: 'cacheMiddleware',
  action: async (ctx, next) => {
    const { useCache = false, cacheConfig = {} } = ctx.req;
    let hasSet = false;

    // console.log('cache method', ctx.req.url, '----', useCache, '----', cacheConfig);
    
    if (useCache) {
      const _res = Cache.get(cacheConfig);

      // 为真时，表示缓存有效
      if (_res) {
        hasSet = true;
        ctx.res = _res;
      }
    }
    // 最后再发出请求;
    await next();

    if (useCache && !hasSet) {
      // console.log('save method', ctx.req.url, '----', ctx.res);
      const res = ctx.res || {};
      Cache.set(res, cacheConfig);
    }
  },
};
