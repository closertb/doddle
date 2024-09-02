export function isFunction(fn) {
    return typeof fn === 'function';
}
export function isNumber(num) {
    return !isNaN(num);
}
export function isUndefined(val) {
    return typeof val === 'undefined';
}
export function isArray(obj) {
    return Array.isArray(obj);
}
/**
 * 将 deps 转换为 Formily.Path 支持的查询条件
 * @param path Deps
 * @returns string
 */
export const getQueryPath = (path) => {
    return typeof path === 'string' ? path : `*(${path.join(',')})`;
};
/**
 *
 */
export const eachPath = (path, cb) => {
    if (typeof path === 'string') {
        return cb(path);
    }
    if (isArray(path)) {
        return path.forEach(p => cb(p));
    }
    return cb();
};
export const formatName = (name) => {
    return Array.isArray(name) ? name.join('.') : `${name}`;
};
export const joinName = (parentName, name) => {
    if (Array.isArray(parentName)) {
        return parentName.concat(name);
    }
    else if (typeof parentName === 'number') {
        return [parentName, name];
    }
    return name;
};
export const splitName = (name) => {
    if (Array.isArray(name)) {
        return name;
    }
    else if (typeof name === 'string') {
        return name.split('.');
    }
    return name;
};
export const ArraryStrReg = /^\[.+\]$/;
export const formatedArrStrToArr = (arrStr) => {
    if (ArraryStrReg.test(arrStr)) {
        try {
            const arr = JSON.parse(arrStr);
            return arr;
        }
        catch (error) {
            return arrStr;
        }
    }
    return arrStr;
};
