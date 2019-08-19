export function prefixType(type, model) {
  const prefixedType = `${model.namespace}/${type}`;
  if (
    (model.reducers && model.reducers[prefixedType]) ||
    (model.effects && model.effects[prefixedType])
  ) {
    return prefixedType;
  }
  return type;
}

export function reduceToObject(source, iterator) {
  const keys = Type.isArray(source) ? source : Object.keys(source);
  const getValue = function(key) {
    return Type.isArray(source) ? key : source[key];
  };
  return keys.reduce((last, key) => {
    const value = iterator(getValue(key), key);
    if (value !== undefined) {
      last[key] = value;
    }
    return last;
  }, {});
}

export const Type = {
  isObject(source) {
    return Object.prototype.toString.call(source) === '[object Object]';
  },
  isFunction(source) {
    return (
      source != null &&
      (source.constructor === Function || source instanceof Function)
    );
  },
  isArray(source) {
    return Array.isArray(source);
  },
  isString(source) {
    return (
      typeof source === 'string' ||
      (!!source &&
        typeof source === 'object' &&
        Object.prototype.toString.call(source) === '[object String]')
    );
  },
  isNumber(source) {
    return (
      source != null &&
      (source.constructor === Number || source instanceof Number)
    );
  },
  isEmpty(value) {
    // null 或者 未定义，则为空
    if (value === null || value === undefined) {
      return true;
    }
    // 传入空字符串，则为空
    if (typeof value === 'string') {
      return value === '';
    }
    // 传入函数，则不为空
    if (typeof value === 'function') {
      return false;
    }
    // 传入数组长度为0，则为空
    if (value instanceof Array) {
      return !value.length;
    }
    // 传入空对象，则为空
    if (value instanceof Object) {
      for (var key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          return false;
        }
      }
    }
  },
};
