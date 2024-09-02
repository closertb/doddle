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
import { Form } from 'antd';
import { useFormContext } from '..';
import { hformListSymbol, formatName } from '../utils/constant';
export function FormList(props) {
    var _a;
    const { name: formName, fullName, rules } = props;
    const { form, watch, actions, _subjects } = useFormContext();
    let _rules = rules;
    const formatedName = formatName(fullName || formName);
    // FormItem 自己没定义rules, 且用了交互组件，那这个规则就是下发下来的
    // TODO: 这里似乎没有覆盖到 actionFunction 场景
    if (!_rules && ((_a = (actions === null || actions === void 0 ? void 0 : actions[formatedName])) === null || _a === void 0 ? void 0 : _a.rules)) {
        _rules = actions === null || actions === void 0 ? void 0 : actions[formatedName].rules;
    }
    _subjects.state.register({ name: formatedName, fullName, rules: _rules });
    return (React.createElement(Form.List, { name: formName, rules: _rules }, (fields, operation, meta) => {
        const { add } = operation, restOperation = __rest(operation, ["add"]);
        const originAdd = add;
        const methods = Object.assign(Object.assign({}, restOperation), { prepend: (data) => { }, insert: (index, data) => { }, update: (index, data) => { }, clear: () => { }, 
            // defaultValue?: StoreValue, insertIndex?: number
            add: (data, options) => {
                originAdd(data);
            } });
        const renderListChild = props.children(fields, methods, meta);
        return renderListChild;
    }));
}
FormList.$type = hformListSymbol;
