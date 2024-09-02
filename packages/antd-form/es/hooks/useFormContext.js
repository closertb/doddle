var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import React from 'react';
const HFormContext = React.createContext(null);
export const useFormContext = () => React.useContext(HFormContext);
export const HFormProvider = (props) => {
    const { children, actions = {}, context = {} } = props, rest = __rest(props, ["children", "actions", "context"]);
    const _actions = {};
    Object.entries(actions).forEach(([key, value]) => {
        _actions[key] = value;
    });
    return (React.createElement(HFormContext.Provider, { value: Object.assign(Object.assign({}, rest), { context, actions: _actions }) }, children));
};
