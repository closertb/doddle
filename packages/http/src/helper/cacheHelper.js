import { Cache, CacheConfig, AutoUpdateDelayTime } from './storage';

// 等待刷新请求的队列
const waitToRequest = {};

// 等待请求响应的队列
const waitToResponse = {};

export function CacheHelper(fetch, params, options) {
  return new Promise(async (resolve, reject) => {
    let _res;
    if (!options.forceUpdate) {
      _res = await Cache.get(options);
    }

    // 如果本次用了缓存，那么延迟一定时候后，自动请求一次，刷新缓存；
    if (_res) {
      // console.log('-------hasCache');
      // 先自己清除一次
      waitToRequest[options.cacheCategory] && clearTimeout(waitToRequest[options.cacheCategory]);
      const timeoutId = setTimeout(() => {
        waitToRequest[options.cacheCategory] = undefined;
        CacheHelper(fetch, params, { ...options, forceUpdate: true, });
      }, options.autoUpdateDelayTime || AutoUpdateDelayTime);
      // 倒计时开始计时
      waitToRequest[options.cacheCategory] = timeoutId;
      resolve(_res);
      return;
    }

    // 如果正在倒计时，则清除倒计时，直接发起请求即可
    if (waitToRequest[options.cacheCategory]) {
      // console.log('-------clear last request queue');
      clearTimeout(waitToRequest[options.cacheCategory]);
      waitToRequest[options.cacheCategory] = undefined;
    }

    let pendingPromise = waitToResponse[options.cacheCategory];

    // like promise;
    if (pendingPromise && pendingPromise.then !== undefined) {
      console.log('-------isPending, use cache request');
    } else {
      // 新建请求;
      pendingPromise = fetch(params);
      waitToResponse[options.cacheCategory] = pendingPromise;
    }

    // 处理请求, 先把缓存数据清除；
    options.clearBeforeResponse && await Cache.remove(options);
    pendingPromise.then(async (value) => {
      waitToResponse[options.cacheCategory] = false;
      await Cache.set(value, options);
      resolve(value);
    }).catch((err) => {
      waitToResponse[options.cacheCategory] = false;
      reject(err);
    });
  });
}