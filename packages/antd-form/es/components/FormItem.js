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
import React, { useEffect } from 'react';
import { useFormContext } from '..';
import { Form } from 'antd';
import { hformItemSymbol, formatName } from '../utils/constant';
export function FormItem(props) {
    const { name, fullName, rules, children, validatedOnMounted = false } = props, others = __rest(props, ["name", "fullName", "rules", "children", "validatedOnMounted"]);
    const { actions, _subjects, form, formStatus } = useFormContext();
    let _rules = rules;
    const formatedName = formatName((fullName || name));
    const registerAction = actions === null || actions === void 0 ? void 0 : actions[formatedName];
    // FormItem 自己没定义rules, 且用了交互组件，那这个规则就是下发下来的
    if (formStatus !== 'view' && !_rules && (registerAction === null || registerAction === void 0 ? void 0 : registerAction.rules)) {
        _rules = actions[formatedName].rules;
    }
    useEffect(() => {
        if (formStatus === 'view' || !registerAction)
            return;
        const rg = _subjects.state.register({
            name: formatedName,
            fullName,
            rules: _rules,
            mounted: true,
        });
        if (validatedOnMounted) {
            // console.log('tttt trigger on mounted', fullName || name);
            form.validateFields([fullName || name])
                // 这里吃掉 抛出去的 error
                .catch(() => { });
        }
        return () => {
            rg.updateState({
                mounted: false,
            });
        };
    }, []);
    return (React.createElement(Form.Item, Object.assign({ name: name, rules: _rules }, others), children));
}
FormItem.$type = hformItemSymbol;
