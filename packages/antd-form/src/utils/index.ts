import { NamePath } from 'rc-field-form/lib/interface';
import { Deps, Noop } from '../types';

export function isFunction(fn: any) {
  return typeof fn === 'function';
}

export function isNumber(num: number) {
  return !isNaN(num);
}

export function isUndefined(val: any) {
  return typeof val === 'undefined';
}

export function isArray(obj: any) {
  return Array.isArray(obj);
}

/**
 * 将 deps 转换为 Formily.Path 支持的查询条件
 * @param path Deps
 * @returns string
 */
export const getQueryPath = (path: Deps) => {
  return typeof path === 'string' ? path : `*(${path.join(',')})`;
};

/**
 *
 */
export const eachPath = (path: Deps, cb: Noop) => {
  if (typeof path === 'string') {
    return cb(path);
  }

  if (isArray(path)) {
    return path.forEach(p => cb(p));
  }

  return cb();
};

export const formatName = (name: NamePath): string => {
  return Array.isArray(name) ? name.join('.') : `${name}`;
};

export const joinName = (parentName: string | number | any[], name: string) => {
  if (Array.isArray(parentName)) {
    return parentName.concat(name);
  } else if (typeof parentName === 'number') {
    return [parentName, name];
  }
  return name;
};

export const splitName = (name: string | any[]) => {
  if (Array.isArray(name)) {
    return name;
  } else if (typeof name === 'string') {
    return name.split('.');
  }
  return name;
};

export const ArraryStrReg = /^\[.+\]$/;

export const formatedArrStrToArr = (arrStr: string) => {
  if (ArraryStrReg.test(arrStr)) {
    try {
      const arr = JSON.parse(arrStr);
      return arr as string[];
    } catch (error) {
      return arrStr;
    }
  }
  return arrStr;
}