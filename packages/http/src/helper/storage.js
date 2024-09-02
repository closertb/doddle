import localForage from "localforage";

export const CacheKey = 'http_cache_key';

const localforage = localForage.createInstance({
  name        : 'http_cache',
  version     : 1.0,
  storeName   : CacheKey
});

// 最长缓存时间一周
export const MaxExpireTime = 7 * 24 * 60 * 60 * 1000;

// 缓存自动更新延迟请求时间: 20 秒
export const AutoUpdateDelayTime =  20 * 1000;


// export interface CacheConfig {
//   cacheKey: string;
//   cacheExpireTime?: number;
//   autoUpdateDelayTime?: number;
//   clearBeforeResponse?: boolean;
//   cacheCategory: string;
//   forceUpdate?: boolean;
// }



const Cache = {
  async set(data, config) {
    const key = `${CacheKey}-${config.cacheCategory}`;

    await localforage.setItem(key, { unique: config.cacheKey, value: JSON.stringify(data), time: Date.now(), expired: false });
  },
  async get(config) {
    const key = `${CacheKey}-${config.cacheCategory}`;
    const _data = await localforage.getItem(key);
    
    if (!_data) {
      return false;
    }

    // 如果已标识过期
    if (_data.expired) {
      return false;
    }

    const expireTime = config.cacheExpireTime || MaxExpireTime;
    const nowTime = Date.now();
    if (_data.unique !== config.cacheKey || !_data.time || (nowTime - _data.time > expireTime)) {
      // 标识缓存失效;
      await localforage.setItem(key, { expired: true });
      return false;
    }
    return JSON.parse(_data.value);
  },
  async remove(config) {
    const key = `${CacheKey}-${config.cacheCategory}`;
    await localforage.removeItem(key);
  }
};

export {
  Cache
};