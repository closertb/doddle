'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports['default'] = void 0;

var qs = _interopRequireWildcard(require('qs'));

var _pathToRegexp = _interopRequireDefault(require('path-to-regexp'));

var _utils = require('../utils');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  } else {
    var newObj = {};
    if (obj != null) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          var desc =
            Object.defineProperty && Object.getOwnPropertyDescriptor
              ? Object.getOwnPropertyDescriptor(obj, key)
              : {};
          if (desc.get || desc.set) {
            Object.defineProperty(newObj, key, desc);
          } else {
            newObj[key] = obj[key];
          }
        }
      }
    }
    newObj['default'] = obj;
    return newObj;
  }
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly)
      symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    keys.push.apply(keys, symbols);
  }
  return keys;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    if (i % 2) {
      ownKeys(source, true).forEach(function(key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(source).forEach(function(key) {
        Object.defineProperty(
          target,
          key,
          Object.getOwnPropertyDescriptor(source, key)
        );
      });
    }
  }
  return target;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

var getQuery = function getQuery(search) {
  return qs.parse(search.slice(1));
};

var getParams = function getParams(match, key) {
  var params = match.slice(1);
  var paramsObj = {}; // 获取匹配的关键字

  var keys = key.match((0, _pathToRegexp['default'])(key)).slice(1); // 将关键字作为params的属性并赋值

  keys.forEach(function(item, index) {
    params[item.slice(1)] = params[index];
    paramsObj[item.slice(1)] = params[index];
  });
  return {
    params: params,
    paramsObj: paramsObj,
  };
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
  return function(props) {
    var dispatch = props.dispatch,
      history = props.history;

    function transform(action) {
      if (_utils.Type.isObject(action)) {
        return function() {
          return dispatch(action);
        };
      }

      return action;
    }

    function listen(pathReg, handleEnter, handleLeave) {
      var listeners = {}; // 保存进入path的路由信息

      var enteredRoute = null;

      if (_utils.Type.isObject(pathReg)) {
        listeners = pathReg;
      } else {
        listeners[pathReg] = [handleEnter, handleLeave];
      }

      history.listen(function(location) {
        var _location$pathname = location.pathname,
          pathname = _location$pathname === void 0 ? '' : _location$pathname,
          _location$search = location.search,
          search = _location$search === void 0 ? '' : _location$search;
        Object.keys(listeners).forEach(function(key) {
          var actions = listeners[key];
          var enterAction = actions;
          var leaveAction = null;

          if (_utils.Type.isArray(actions)) {
            enterAction = actions[0];
            leaveAction = actions[1];
          }

          enterAction = transform(enterAction);
          leaveAction = transform(leaveAction);
          var match = (0, _pathToRegexp['default'])(key).exec(pathname);

          if (match) {
            // 获取 query
            var query = getQuery(search);
            /**
             * params 获取到的数据：[1, id: 1]
             * paramsObj 是一个普通对象，如：{ id: 1 }
             */

            var _getParams = getParams(match, key),
              params = _getParams.params,
              paramsObj = _getParams.paramsObj;

            var route = (enteredRoute = _objectSpread({}, location, {
              params: params,
              paramsObj: paramsObj,
              query: query,
            }));

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

    subscriber(
      _objectSpread({}, props, {
        listen: listen,
      })
    );
  };
}

var _default = {
  subscription: function subscription() {
    var subscriptions =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return (0, _utils.reduceToObject)(subscriptions, createWrappedSubscriber);
  },
};
exports['default'] = _default;
