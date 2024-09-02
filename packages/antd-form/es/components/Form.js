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
import { useFormContext } from '../hooks/useFormContext';
import { debounce } from 'lodash-es';
// import { debounce } from 'lodash-es';
export function HForm(props) {
    const { name, onValuesChange, onFinishFailed, onFieldsChange, onFinish } = props, others = __rest(props, ["name", "onValuesChange", "onFinishFailed", "onFieldsChange", "onFinish"]);
    const { form, formState, trigger } = useFormContext();
    const proxyFormMethods = {
        onFieldsChange: (changedFields, allFields) => {
            const { validating } = formState.current;
            onFieldsChange && onFieldsChange(changedFields, allFields);
            if (validating) {
                console.log('wwww on validating');
                return;
            }
            changedFields === null || changedFields === void 0 ? void 0 : changedFields.forEach((changedField) => {
                trigger(changedField, true);
            });
        },
    };
    if (typeof onFinishFailed === 'function') {
        proxyFormMethods.onFinishFailed = (errorInfo) => {
            debounce(() => {
                console.log('wwww clear validating onFinishFailed');
                formState.current.validating = false;
            }, 200)();
            onFinishFailed(errorInfo);
        };
    }
    if (typeof onFinish === 'function') {
        proxyFormMethods.onFinish = (errorInfo) => {
            debounce(() => {
                console.log('wwww clear validating onFinish');
                formState.current.validating = false;
            }, 200)();
            onFinish(errorInfo);
        };
    }
    // @ts-ignore
    return (React.createElement(Form, Object.assign({}, others, proxyFormMethods, { form: form, onValuesChange: onValuesChange, name: name })));
}
HForm.useForm = Form.useForm;
HForm.useWatch = Form.useWatch;
