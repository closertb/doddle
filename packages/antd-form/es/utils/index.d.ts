import { NamePath } from 'rc-field-form/lib/interface';
import { Deps, Noop } from '../types';
export declare function isFunction(fn: any): boolean;
export declare function isNumber(num: number): boolean;
export declare function isUndefined(val: any): val is undefined;
export declare function isArray(obj: any): obj is any[];
/**
 * 将 deps 转换为 Formily.Path 支持的查询条件
 * @param path Deps
 * @returns string
 */
export declare const getQueryPath: (path: Deps) => string;
/**
 *
 */
export declare const eachPath: (path: Deps, cb: Noop) => void;
export declare const formatName: (name: NamePath) => string;
export declare const joinName: (parentName: string | number | any[], name: string) => string | any[];
export declare const splitName: (name: string | any[]) => any[];
export declare const ArraryStrReg: RegExp;
export declare const formatedArrStrToArr: (arrStr: string) => string | string[];
