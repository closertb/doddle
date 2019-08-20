---
title: dva 扩展
order: 2
---

### 安装

```shell
npm install @doddle/dva
```

### 使用

在项目入口文件中 hook app 对象

> 注意：一定要在注册 model 以及插件之前使用.

```javascript
import dva from 'dva';
import hook from '@core/dva';

const app = dva();

hook({
  app,
  plugins, // 自定义插件
}); //

app.use(...);
app.use(...);

app.model(...);

app.start();
```

### 插件

dva 扩展模块，在 dva 的插件基础上扩展了 model 插件功能，其 hooks 包含两部分：

- model 注册 hook（state、subscription、effect、reducer）, app 注册 model 的时候会调用插件的 hook 并返回新的对象。
- dva 官方 hook，具体请参考官方插件指南

现有的功能都是在插件的基础上实现的，默认集成如下插件：

- update
- put
- listen
- loading
- select

如果您需要根据需求设置插件，则可以在 hook 时传入自定义的插件.

```javascript
import dva from 'dva';
import hook, { plugin } from '@core/dva';

const app = dva();

const plugins = [plugin.update, plugin.put, plugin.loading];

hook({
  app,
  plugins,
});
```

下面分别介绍各个插件提供的功能。

#### update 插件

新增 update effect, 方便进行 state 数据更新操作，避免为每次 state 更改设置 reducer.
update 插件会给所有 model 添加 updateState reducer

```
{
  reducer: {
    updateState() {
      ...
    }
  }
}
```

使用示例：

```
//model
export default {
  namespace: 'user',
  effects: {
    * fetchUsers({ payload }, {call, update}) {
      const users = yeild call(services.user.getList);
      yield update({ users });
    },
  }
}
```

#### put 插件

简化 put effect 的书写，put 仍然保留 dva 官方 resolve 扩展。参考如下示例：

```
// 原始put
yield put({ type: 'updateUsers', payload: { users }});
// 简化之后
yield put('updateUsers', { users });


yield put.resolve({ type: 'other/fetch'})
// or
yield put.resolve('other/fetch')

```

#### listen 插件

为方便对浏览器 path 的监听，在 model 的 subscriptions 配置函数中，添加扩展方法`listen`自动处理路由监听以及参数。

`listen`函数参数如下：

- pathReg 需要监听的 pathName，它支持被 [pathToRegexp](https://github.com/pillarjs/path-to-regexp) 解析
- action
  action 既可以是 redux action，也可以是一个回调函数
  如果`action`是函数，调用时，将传入`{ ...location, query, params, paramsObj }`作为其参数
  **query** 为普通对象，用法：const { sid } = query
  **params** 为类数组，支持的用法有：const [id] = params 或 const { id } = params
  **paramsObj** 为普通对象，和 params 的数据一样，只是数据结构不同，所以用法只有：const { id } = paramsObj

listen 函数也支持同时对多个 pathname 的监听，传入的参数需要为`{pathReg: action}`健值对的对象
listen 函数可以传入两个回调，分别表示进入 path 时和离开 path 时

```javascript
import model from 'configs/model';
import qs from 'qs';

export default {
  namespace: 'user',

  subscriptions: {
    setup({ dispatch, listen }) {
      // action 为 redux action
      listen('/user/list', { type: 'fetchUsers'});

      // action 为回调函数1
      listen('/user?sid=1', ({ query }) => dispatch({ type: 'fetchUser', payload: query }));

      // action 为回调函数2
      listen('/user/:userId/project/:proojectId', () => dispatch({ type: 'fetchUsers' }));

      // 支持对多个 path 的监听
      listen({
        '/user/list': ({ query, params }) => {},
        '/user/query': ({ query, params }) => {},
      });

      // 在之前的用法之上，传入第三个参数表示离开 path 的回调
      listen('/user/list', { type: 'fetchUsers'}, { type: 'clearUsers'});

      // 同上也支持对多个 path 的监听
      listen({
        '/user/list': [({ query, params }) => { console.log('enter'); }, ({ query, params }) => { console.log('leave'); }],
        '/user/query': [({ query, params }) => { console.log('enter'); }, ({ query, params }) => { console.log('leave'); }],
      });
    },
  },
  effects: {
    * fetchUsers({ payload }, { select }) {
      const { userId, proojectId } = yield select('user');
      ...
    },
  },
})
```

#### select 插件

简化 select effect 的使用, 提供以下三种用户:

```
const { list } = yield select(({ user }) => user);
const { list } = yield select('user');
const [user, department] = yield select(['user', 'department']);
```

#### loading 插件

主要为了方便对 loading 状态进行处理。loading 插件灵感来源于[dva-loading 插件](https://github.com/dvajs/dva/tree/master/packages/dva-loading)。
在设计上与官方插件稍有不同，官方插件 loading 状态使用全局的 model 处理，而 loading 插件会将各 model 的 loading 状态，保存在当前 namespace 的 state 中。

使用 loading 插件后，会给所有 model 添加 loading state 以及 updateLoading reducer, 请注意对应的命名，以避免被覆盖

```javascript
state: {
  loading: {}
},
reducer: {
  updateLoading() {
    ...
  }
}
```

loading 插件会自动处理 effect 级别 loading，在 model effect 执行前后自动更新 loading 中对应 effetName 的状态，使用方式如下：

```javascript
// model
{
  namespace: 'book'
  effects: {
    * fetch() {
      yield call(..)
    }
  }
}


// 执行fetch前state
{
  loading: {
    fetch: true,
  }
}

// 执行fetch后state
{
  loading: {
    fetch: false,
  }
}


// page
connect(({ book}) => {
  // 这里可以聚合loading属性
  return book;
})(Page)

function (props) {
  const onSave = () => {
    await props.save();
    message.warn('保存成功')
  }
  return <Spin loading={props.loading.save}></Spin><div onClick={onSave}>保存</div>
}
```

### 如何编写插件

如果以上插件都不能满足你的业务场景，您也可以通过编写自定义插件来实现。

上面提到过插件体系包含 model hooks 以及 dva hook。 model hooks 的使用，在注册 model 的时候，会传入对应的属性，根据您的需求进行加工处理后，返回新的属性。

model hooks 主要包含如下方法：

- state
- subscription
- effect
- reducer

dva hooks 使用方式请参考[官方文档](https://dvajs.com/api/#app-use-hooks).

- onError
- onStateChange
- onAction
- onHmr
- onReducer
- onEffect
- extraReducers
- extraEnhancers
- \_handleActions

#### state hook

用于注册 model 时候，添加额外的 state

```
{
  state(initState = {}) {
    return {
      ...initState,
      loading: {},
    }
  }
}
```

#### subscription

用于扩展 subscription 功能，listen 插件主要通过 subscription 实现

```javascript
{
  subscription(subscriptions = {}) {
    return reduce(subscriber, (subsc, key) => {
      return (props) => {
        const { dispatch, history } = props;
        function listen(..) {
          ...
        }
        subscriber(...props, listen);
      }
    })
  }
}
```

#### effect

暂不推荐使用，建议使用`onEffect`

#### reducer

用于注册 model 时候，添加额外的 reducer

```
{
  reducer(reducers = {}) {
    return {
      ...reducers,
      updateLoading() {
        ...
      }
    }
  }
}
```

#### onEffect

主要用于封装 effect 执行，提供额外的扩展，属于 dva 官方的插件 hook，由于现有的插件对 onEffect 使用较多，这里单独说明一下。

入口参数：

- effect, prev effect 函数
- safaEffects, saga 官方提供的 effects 对象
- model 当前 model 对象

返回参数，需要返回 generator 函数，方便下一个插件或者执行器执行，在 generator 函数内部，需要 onEffect 的 effect 函数，并返回结果，以执行 resolve.

> 注意：
>
> 1. 如果您需要扩展 effects，执行 effect 时，由于 sagaEffects 是 saga 官方的 effect 对象，故需要通过 effects || sagaEffects 来获取您前一次插件扩展之后的 effects.
> 2. 在内部的 generator 函数，必须将 effect 执行的结果返回，否则 dispatch().then 中无法获取返回的结果值

以下为 update plugin 的示例：

```javascript

function createEffects(sagaEffects, model) {
  const { put } = sagaEffects;
  function update(payload) {
    return put(prefixType('updateState', model), payload)
  }
  return { ...sagaEffects, update }
}

{
  onEffect(effect, sagaEffects, model) {
    return function* effectEnhancer(action, effects) {
      const result = yield effect(action, createEffects(effects || sagaEffects, model));
      return result;
    }
  }
```

### API

**hook**

hook 函数的作用，主要用来劫持 app 对象，方便做一些定制化处理。

| 参数          | 说明                                          | 类型    | 默认值 |
| ------------- | --------------------------------------------- | ------- | ------ |
| app           | dva 对象                                      | Object  | -      |
| plugins       | 自定义插件                                    | Array   | -      | - |
| legacyLoading | 是否启用兼容 loading 对象，主要为了兼容老项目 | boolean | false  |
