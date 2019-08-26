## HTTP 请求类

由于各服务端的数据格式不一致，故提供通用的 http 类，以屏蔽底层细节，方便复用，并且实现了中间件的机制以方便扩展。

### 如何创建 http 实例

`Http`是请求类`class`, 实际使用的时候，需要创建一个实例化的对象, 可通过以下两种方式创建新的实例

- Http.create(config,middlewares)
- new Http(config,middlewares)

通过`Http`类静态方法`create`创建的实例，默认会添加`default.config`以及`defaults.middlewares`配置.
通过`Http`构造器创建的实例，则不会添加默认的配置以及中间件

也可以通过`http`实例的`create`方法创建新的实例，这种方式创建的实例会继承当前实例的`config`以及`middlewares`配置,

```javascript
//建议在应用系统先创建一个基础的http实例，其他的http再通过实例的create方法来扩展
//create方法支持4种参数场景：
http.create('domain');
http.create(config);
http.create(middlewares);
http.create(config, mddlewares);
```

### 如何发送`ajax`请求

通过上述方法创建`http`实例后，可通过实例上的`get`以及`post`等方法发送`ajax`请求

```javascript
// url请求的路径，data请求的数据，options参数
fetch(url, options);
get(url, data, options);
post(url, data, options);
patch(url, data, options);
put(url, data, options);
del(url, options);
head(url, options);

// example

// util/http.js
import { Http } from 'carno/addons';

// 创建base http实例
export default Http.create({
  servers: getEnvServers(),
  contentType: 'form',
  header() {
    return {
      sid: cookie.get('sid'),
      st: cookie.get('st'),
    };
  },
});

// servers/admin.js
import http from 'utils/http';

const { get, post } = http.create('admin');

export function getUserList() {
  return get('/get/user/list');
}

export function saveUser(user) {
  return post('/save/user', user);
}

export function deleteUser(id) {
  return get(
    '/save/user',
    { id },
    {
      ignoreErrorModal: true,
    }
  );
}
```

**options 参数**

| 参数                       | 说明                                   | 类型                                 | 默认值 |
| -------------------------- | -------------------------------------- | ------------------------------------ | ------ |
| ignoreErrorModal           | 忽略默认的错误提示框                   | boolean                              | false  |
| contentType                | 参数类型, 支持 form,formData,json,text | string                               | form   |
| customHeader               | 自定义 header                          | {}                                   | -      |
| customDataTransform        | 自定义数据处理                         | function(data, options, request)     | -      |
| customRequestErrorHandler  | 自定义请求错误处理                     | function(\_requestError)             | -      |
| customResponseErrorHandler | 自定义响应错误处理                     | function(\_responseError, \_request) | -      |
| responseStatusResult       | 自定义响应状态码处理                   | function(\_response)                 | -      |

### HTTP 中间件

http 的核心是通过中间件以及配置对象实现，通过类`create`方法创建的中间件默认将继承如下中间件

> 注意：0.8.0 版本以后，为简化`http`开发，不建议用户自行组合中间件，建议使用默认中间件配合`config`来实现扩展功能

```javascript
// 默认中间件
middlewares.requestDomain();
middlewares.requestQuery();
middlewares.requestHeader();
middlewares.requestDataTransform();
middlewares.requestErrorHandler();
middlewares.responseStatus();
middlewares.responseJson();
middlewares.responseDataStatus();
middlewares.responseAuthorityValidator();
middlewares.responseErrorHandler();
middlewares.responseDataContent();
```

**requestDomain**
domain 中间件，发送请求后，自动给`url`加上`domain`对应的`host`地址, 需要配合`config`中`domain`以及`servers`使用
中间件里面`useMockProxyType`默认值为 1, 配合`config`中`useMockProxyType`可以开关 mock 服务

**requestQuery**
查询字符串中间件，主要用于添加统一的权限字符串，需要配合`config`中`query`参数使用

**requestHeader**
请求`header`中间件，用于配置自定义`header`, 需要配合`config`中`header`以及`customHeader`使用

**requestDataTransform**
处理请求数据格式中间件，配合`config`中的`contentType`,可以添加`context-type` `header`以及请求参数的格式, 可通过`config`中`customDataTransform`参数扩展

**requestErrorHandler**
请求错误处理中间件, 可配合`config`中`requestErrorHandler`以及`customRequestErrorHandler`参数进行扩展

**responseStatus**
响应状态码中间件，如果状态码`status >= 200 && status < 300` 则代表请求成功，否则将请求结果设置为失败

**responseJson**
自动转化`response`结果为`json`, 如果`config`中设置`json`为 false，则不自动转化`json`

**responseDataStatus**
服务器响应数据状态码中间件, 如果相应数据`status.toUpperCase() == 'ERROR'`则代表请求失败，可配合`config`中`responseDataValidator`参数进行扩展

**responseAuthorityValidator**
授权失败处理中间件, 如果服务端响应的`errorCode`为指定的参数，则代表授权失败，自动调整到`login`页面，并弹出`message`提示框，纪录最后登录的`hash`页面，可以通过`authorityFailureCodes`、`authorityFailureHash`、`authorityValidator`参数扩展

**responseErrorHandler**
错误提示框中间件, 服务端请求失败后，自动弹出提示框显示错误消息，可通过`customResponseErrorHandler`以及`responseErrorHandler`参数扩展

**responseDataContent**
返回服务端响应中业务数据中间件，需要配合`config`中`contextKey`参数使用

### HTTP 配置

http 默认参数如下:

```javascript
{
  domain: '',
  servers: {},
  contentType: 'form',
  credentials: false,
}
```

示例如下:

```javascript

//fermi
export default Http.create({
  servers: {...}
  contentType: 'json',
  authorityFailureCodes: [401],
  // 0 - 仅使用mock数据；1 - 部分使用mock数据；2 - 不使用mock数据
  useMockProxyType: 2,
  header() {
    return { Authentication: cookie.get('sid') };
  }
});

//franlin
export default Http.create({
  servers: {...}
  authorityFailureCodes: ['120001', '120002', '120008', '21270023'],
  credentials: 'include',
  header() {
    return { Authentication: cookie.get('sid') };
  }
});

//gibbs
export default Http.create({
  servers: [...],
  authorityFailureCodes: ['120001', '120010', '120002', '120008', 'error'],
  query() {
    return { sid: cookie.get('sid'), st: cookie.get('st') }
  },
  dataTransform(data, option) {
    Object.assign(data, { sid: cookie.get('sid'), st: cookie.get('st') })
    return { data, options }
  }
});

export queryList() {
  return post('/query/list', {}, {
    customResponseErrorHandler(response, request) {
      if(response.status === 403 ) {
        Modal.info({
          title: '提示',
          content: '查询已达到上限！',
        });
        // 跳过默认的错误处理
        request.options.ignoreErrorHandler = true;
      }
    }
  });
}

// fourier
export default Http.create({
  servers: [...],
  contentType: 'json',
  authorityFailureCodes: [['701', '901']],
  header() {
    return {
      Authentication: JSON.stringify({
        token: cookie.get('token'),
        username: cookie.get('username'),
        name: window.encodeURIComponent(cookie.get('name') || '')
      })
    };
  }
});


```

**参数说明**

| 参数                  | 说明                                                                                                                       | 类型                                 | 默认值                         |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------ |
| domain                | 域／服务端名称                                                                                                             | string                               | -                              |
| servers               | 服务地址对象                                                                                                               | object                               | -                              |
| query                 | 统一查询字符串                                                                                                             | object                               | -                              |
| credentials           | cros 跨域 cookie 配置, 如需跨域 cookie 请设置为'include', 详情参考[fetch](https://github.com/github/fetch#sending-cookies) | string                               | -                              |
| contentType           | 默认的参数数据类型, 支持 form,formData,json,text                                                                           | string                               | -                              |
| contentKey            | 响应数据中业务数据对应的`key`                                                                                              | string                               | -                              |
| useMockProxyType      | 使用 mock 代理类别：0 - 仅使用 mock 数据；1 - 部分使用 mock 数据；2 - 不使用 mock 数据                                     | number                               | 1                              |
| header                | 统一请求 header                                                                                                            | object or function(request)          | -                              |
| dataTransform         | 请求参数转化函数                                                                                                           | function(data, options, request)     | -                              |
| requestErrorHandler   | 请求错误处理函数, 如果设置此参数，则会跳过默认错误处理                                                                     | function(data, options, request)     | -                              |
| responseDataValidator | 响应数据校验, 判断响应数据是否为失败状态                                                                                   | function(\_responseError, \_request) | -                              |
| authorityFailureCodes | 授权错误 code                                                                                                              | array                                | ['120001', '120002', '120008'] |
| authorityFailureHash  | 授权错误后调整的路由`hash`                                                                                                 | string                               | '/login'                       |
| authorityValidator    | 授权错误处理, 如果设置此参数，则会跳过默认授权错误处理                                                                     | function(\_responseError, \_request) | -                              |
| afterAuthorityFailure | 授权错误后置处理函数，用于调整路由前做一些清理动作                                                                         | function(\_responseError, \_request) | -                              |
| responseErrorHandler  | 响应错误处理, 可通过设置`request.options.ignoreErrorModal`跳过默认的错误处理                                               | function(\_responseError, \_request) | -                              |
