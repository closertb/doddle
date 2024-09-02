export const hformItemSymbol = Symbol('hformItem');
export const hformListSymbol = Symbol('hformList');
export const formatName = (name) => Array.isArray(name) ? name.join('.') : name;
export const joinName = (parentName, name) => {
    if (Array.isArray(parentName)) {
        return parentName.concat(name);
    }
    else if (typeof parentName === 'number') {
        return [parentName, name];
    }
    return name;
};
