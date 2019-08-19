import * as qs from 'qs';
import pathToRegexp from 'path-to-regexp';
import { Type, reduceToObject } from '../utils';

const getQuery = search => qs.parse(search.slice(1));

const getParams = (match, key) => {
  const params = match.slice(1);
  const paramsObj = {};
  // 获取匹配的关键字
  const keys = key.match(pathToRegexp(key)).slice(1);
  // 将关键字作为params的属性并赋值
  keys.forEach((item, index) => {
    params[item.slice(1)] = params[index];
    paramsObj[item.slice(1)] = params[index];
  });

  return { params, paramsObj };
};

/**
 * 扩展subscription函数的参数,支持listen方法，方便监听path改变
 *
 * listen函数参数如下:
 * pathReg 需要监听的pathname
 * action 匹配path后的回调函数，action即可以是redux的action,也可以是回调函数
 * listen函数同时也支持对多个path的监听，参数为{ pathReg: action, ...} 格式的对象
 *
 * 示例:
 * subscription({ dispath, history, listen }) {
 *  listen('/user/list', { type: 'fetchUsers'});
 *  listen('/user/query', ({ query, params }) => {
 *    dispatch({
 *      type: 'fetchUsers',
 *      payload: params
 *    })
 *  });
 *  listen({
 *    '/user/list': ({ query, params }) => {},
 *    '/user/query': ({ query, params }) => {},
 *  });
 * }
 */
function createWrappedSubscriber(subscriber) {
  return props => {
    const { dispatch, history } = props;

    function transform(action) {
      if (Type.isObject(action)) {
        return () => dispatch(action);
      }
      return action;
    }

    function listen(pathReg, handleEnter, handleLeave) {
      let listeners = {};
      // 保存进入path的路由信息
      let enteredRoute = null;

      if (Type.isObject(pathReg)) {
        listeners = pathReg;
      } else {
        listeners[pathReg] = [handleEnter, handleLeave];
      }

      history.listen(location => {
        const { pathname = '', search = '' } = location;

        Object.keys(listeners).forEach(key => {
          const actions = listeners[key];

          let enterAction = actions;
          let leaveAction = null;

          if (Type.isArray(actions)) {
            enterAction = actions[0];
            leaveAction = actions[1];
          }

          enterAction = transform(enterAction);
          leaveAction = transform(leaveAction);

          const match = pathToRegexp(key).exec(pathname);
          if (match) {
            // 获取 query
            const query = getQuery(search);

            /**
             * params 获取到的数据：[1, id: 1]
             * paramsObj 是一个普通对象，如：{ id: 1 }
             */
            const { params, paramsObj } = getParams(match, key);
            const route = (enteredRoute = {
              ...location,
              params,
              paramsObj,
              query,
            });
            enterAction(route);
          } else if (enteredRoute && leaveAction) {
            // 1、没有匹配path，且enteredRoute不为null
            // 2、那就表示离开path，并触发onLeave
            leaveAction(enteredRoute);
            enteredRoute = null;
          }
        });
      });
    }

    subscriber({ ...props, listen });
  };
}

export default {
  subscription(subscriptions = {}) {
    return reduceToObject(subscriptions, createWrappedSubscriber);
  },
};
