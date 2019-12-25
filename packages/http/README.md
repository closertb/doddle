### 如何创建 http 实例

`Http`是请求类`class`, 实际使用的时候，需要创建一个实例化的对象, 可通过以下两种方式创建新的实例

- Http.create(config)
- new Http(config)

两种创建都默认会添加 defaults middlewares`配置.

```javascript
//在应用系统先创建一个基础的http实例，其他的http再通过实例的create方法来扩展
http.create('domain');
```

**config 参数**

| 参数           | 说明                          | 类型                | 默认值 |
| -------------- | ----------------------------- | ------------------- | ------ |
| servers        | 支持的服务域名对象            | object              | {}     |
| query          | 统一查询字符串                | function            | --     |
| contentKey     | 响应数据中业务数据对应的`key` | string              | ''     |
| bodyParam      | fetch init 参数设置           | { mode: 'no-cors' } |        |
| beforeRequest  | 请求发起前自定义中间件集合    | array               | []     |
| beforeResponse | 请求响应前自定义中间件集合    | array               | []     |

### 如何发送`ajax`请求

通过上述方法创建实例后，可通过实例上的`get`以及`post`等方法发送`ajax`请求

```javascript
// url请求的路径，data请求的数据，options参数
get(url, data, options);
post(url, data, options);

// example

// util/http.js
import Http from '@doddle/http';

// 创建base http实例
export default Http.create({
  servers: getEnvServers(), // 必传
  query() {
    return {
      token: cookie.get('token'),
    };
  },
});

// servers/admin.js
import http from 'utils/http';

const { get, post } = http.create('admin');

export function getUserList(params) {
  return get('/get/user/list', params);
}

export function saveUser(user) {
  return post('/save/user', user);
}

export function deleteUser(id) {
  return get('/save/user', { id }, { ignoreErrorModal: true });
}
```

**options 参数**

| 参数        | 说明                                            | 类型    | 默认值         |
| ----------- | ----------------------------------------------- | ------- | -------------- |
| ignoreQuery | 是否忽略携带 query 参数                         | boolean | false          |
| type        | contentType 参数设置, 支持 form, formData, json | string  | form           |
| headers     | fetch init 参数的 headers 设置                  | {}      | 继承构造函数的 |
| [others]    | fetch init 参数其他设置                         | --      | 继承构造函数的 |

### HTTP 中间件

http 的核心是通过中间件以及配置对象实现，可通过在 http 实例构造时，在 beforeQuest 或 beforeResponse 中设置，也可通过 http.use(middleware, order, replaceCount)中设置；

```javascript
// 默认中间件, 也是其依次处理的顺序
  addRequestDomain,
  addRequestQuery,
  fetchRequest,
  responseStatusHandle,
  responseContentHandle,
```

- **requestDomain**  
  domain 中间件，发送请求后，自动给`url`加上对应的`server`地址, 需要配合`servers`使用

- **requestQuery**  
  查询字符串中间件，主要用于添加统一的权限字符串，需要配合`query`参数使用

- **fetchRequest**  
  fetch 发起，核心

- **responseStatusHandle**  
  响应状态码中间件，如果状态码`status >= 200 && status < 300` 则代表请求成功，否则将请求结果设置为失败

- **responseContentHandle**
  依据 contentKey,自动将响应中数据对应的 key，作为最后的响应结果

## 设计思路

见[边看边写：基于 Fetch 仿洋葱模型写一个 Http 构造类](https://closertb.site/#/blog/33)

[项目 demo](https://github.com/closertb/koa-spring-client)
