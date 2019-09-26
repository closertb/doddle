### 洋葱模型

学过或了解过 Node 服务框架 Koa 的，都或许听过洋葱模型和中间件。恩，就是吃的那个洋葱，见下图：
![image](https://user-images.githubusercontent.com/22979584/64966275-0f6bd380-d8d1-11e9-9219-28ea026e3030.png)  
Koa 是通过洋葱模型实现对 http 封装，中间件就是一层一层的洋葱，这里推荐两个 Koa 源码解读的文章，当然其源码本身也很简单，可读性非常高。

- [Koa.js 设计模式-学习笔记][1]
- [从头实现一个 koa 框架][2]

我这里不过多讲关于 Koa 的设计模式与源码，理解 Koa 的中间件引擎源码就行了。写这篇文章的目的，是整理出我参照 Koa 设计一个 Http 构造类的思路，此构造类用于简化及规范日常浏览器端请求的书写：

```javascript
// Koa中间件引擎源码
function compose(middlewares = []) {
  if (!Array.isArray(middlewares))
    throw new TypeError('Middleware stack must be an array!');

  for (const fn of middlewares) {
    if (typeof fn !== 'function')
      throw new TypeError('Middleware must be composed of functions!');
  }

  const { length } = middlewares;
  return function callback(ctx, next) {
    let index = -1;
    function dispatch(i) {
      let fn = middlewares[i];
      if (i <= index)
        return Promise.reject(new Error('next() called multiple times'));
      index = i;
      if (i === length) {
        fn = next;
      }
      if (!fn) {
        return Promise.resolve();
      }
      try {
        return Promise.resolve(fn(ctx, dispatch.bind(null, i + 1)));
      } catch (error) {
        return Promise.reject(error);
      }
    }
    return dispatch(0);
  };
}
```

### Fetch

[概念（摘自 MDN）][4]: Fetch 的核心在于对 HTTP 接口的抽象，包括 Request，Response，Headers，Body，以及用于初始化异步请求的 global fetch。得益于 JavaScript 实现的这些抽象好的 HTTP 模块，其他接口能够很方便的使用这些功能。听着咋感觉有点像浏览器端的 Koa(joke)。但是使用上对我们业务编写还是不那么友好，虽然相较于 ajax，已经好太多。下面展示两个用 fetch 发送 get 请求和 post 请求的代码示例：

```javascript
  语法： Promise<Response> fetch(input[, init]);
  ** 以下代码展示都是以input字段为请求url的方式展示
  // get 请求
  fetch('http://server.closertb.site/client/api/user/getList?pn=1&ps=10')
   .then(response => {
     if(reponse.ok) {
       return data.json();
      } else {
       throw Error('服务器繁忙，请稍后再试；\r\nCode:' + response.status)
     }
  })
   .then((data) => { console.log(data); });

  // post 请求
  fetch('http://server.closertb.site/client/api/user/getList',
    {
      method: 'POST',
      body: 'pn=1&ps=10',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }
  ).then(response => {
     if(reponse.ok) {
       return data.json();
      } else {
       throw Error('服务器繁忙，请稍后再试；\r\nCode:' + response.status)
     }
  })
   .then((data) => { console.log(data); })
```

从上面的示例,我们可以感觉到，每一个请求发起，都需要用完整的 url，遇到 post 请求，设置 Request Header 是一个比较大的工作，接收响应都需要判断 respones.ok 是否为 true(如果不清楚，请参见 mdn 链接)，然后 response.json()得到返回值，有可能返回值中还包含了 status 与 message，所以要拿到最终的内容，我们还得多码两行代码。如果某一天，我们需要为每个请求加上凭证或版本号，那代码更改量将直接 Double, 所以希望设计一个基于 fetch 封装的，支持中间件的 Http 构造类来简化规范日常前后端的交互，比如像下面这样：

```javascript
  // 在一个config.js 配置全站Http共有信息, eg：
  import Http from '@doddle/http';

  const servers = {
    admin: 'server.closertb.site/client'
  }
  export default Http.create({
    servers,
    contentKey: 'content',
    query() {
      const token = cookie.get('token');
      return token ? { token: `token:${token}` } : {};
    },
    ...
  });

  // 在services.js中这样使用
  import http from '../configs.js';

  const { get, post } = http.create('admin');
  const params = { pn: 1, ps: 10 };

  get('/api/user/getList', params)
    .then((data) => { console.log(data); });


  post('/api/user/getList', params, { contentType: 'form' })
    .then((data) => { console.log(data); });
```

上面的代码，看起来是不是更直观，明了。

### 设计分析

从上面的分析，这个 Http 构造类需要包含以下特点：

- 服务 Url 地址的拼接，支持多个微服务
- 请求地址带凭证或其他统一标识
- 请求状态判断
- 请求目标内容获取
- 错误处理
- 请求语义化，即 get, post, put 这种直接标识请求类型
- 请求参数格式统一化

参照上面的理想化示例，首先尝试去实现 Http.create(伪代码)：

```javascript
export default class Http {
  constructor(options) {
    const { query, servers } = options;
    // do something
    this.init();
  }
  // 静态方法
  static create(options) {
    return new Http(options);
  }
  create(service) {
    // do something
    return (requestMethods = { get, post, put });
  }
  use() {
    // do something
  }
  init() {
    // do something
  }
}
```

[1]: https://chenshenhai.github.io/koajs-design-note/
[2]: https://zhuanlan.zhihu.com/p/35040744
[3]: https://segmentfault.com/a/1190000010107288
[4]: https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Basic_concepts
