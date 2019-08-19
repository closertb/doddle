'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.prefixType = prefixType;
exports.reduceToObject = reduceToObject;
exports.Type = void 0;

function _typeof(obj) {
  if (typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol') {
    _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj &&
        typeof Symbol === 'function' &&
        obj.constructor === Symbol &&
        obj !== Symbol.prototype
        ? 'symbol'
        : typeof obj;
    };
  }
  return _typeof(obj);
}

function prefixType(type, model) {
  var prefixedType = ''.concat(model.namespace, '/').concat(type);

  if (
    (model.reducers && model.reducers[prefixedType]) ||
    (model.effects && model.effects[prefixedType])
  ) {
    return prefixedType;
  }

  return type;
}

function reduceToObject(source, iterator) {
  var keys = Type.isArray(source) ? source : Object.keys(source);

  var getValue = function getValue(key) {
    return Type.isArray(source) ? key : source[key];
  };

  return keys.reduce(function(last, key) {
    var value = iterator(getValue(key), key);

    if (value !== undefined) {
      last[key] = value;
    }

    return last;
  }, {});
}

var Type = {
  isObject: function isObject(source) {
    return Object.prototype.toString.call(source) === '[object Object]';
  },
  isFunction: function isFunction(source) {
    return (
      source != null &&
      (source.constructor === Function || source instanceof Function)
    );
  },
  isArray: function isArray(source) {
    return Array.isArray(source);
  },
  isString: function isString(source) {
    return (
      typeof source === 'string' ||
      (!!source &&
        _typeof(source) === 'object' &&
        Object.prototype.toString.call(source) === '[object String]')
    );
  },
  isNumber: function isNumber(source) {
    return (
      source != null &&
      (source.constructor === Number || source instanceof Number)
    );
  },
  isEmpty: function isEmpty(value) {
    // null 或者 未定义，则为空
    if (value === null || value === undefined) {
      return true;
    } // 传入空字符串，则为空

    if (typeof value === 'string') {
      return value === '';
    } // 传入函数，则不为空

    if (typeof value === 'function') {
      return false;
    } // 传入数组长度为0，则为空

    if (value instanceof Array) {
      return !value.length;
    } // 传入空对象，则为空

    if (value instanceof Object) {
      for (var key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          return false;
        }
      }
    }
  },
};
exports.Type = Type;
