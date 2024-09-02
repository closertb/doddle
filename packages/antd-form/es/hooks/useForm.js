var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import React, { useCallback, useEffect, useMemo } from 'react';
import { FormPath } from '@formily/core';
import { debounce, isObject } from 'lodash-es';
import createDepsSubject from '../utils/createDepsSubject';
import createFormStateSubject from '../utils/createFormStateSubject';
import { formatName } from '../utils';
export function useForm(props) {
    const _formControl = React.useRef();
    const mountTriggerCallbacks = [];
    const formState = React.useRef({
        validating: false,
        // 表单是否初始化完成
        hasInited: false,
        queue: new Map(),
        fieldTriggerInError: new Set(),
    });
    const { form } = props;
    const _subjects = useMemo(() => ({
        deps: createDepsSubject(),
        state: createFormStateSubject(form),
    }), [form]);
    const trigger = useCallback((changedField, clearErrorFlag) => {
        const fieldTriggerInError = formState.current.fieldTriggerInError;
        if (!changedField.touched) {
            return;
        }
        if (changedField.validating) {
            fieldTriggerInError.add(formatName(changedField.name));
            return;
        }
        // TODO 定时去清空fieldTriggerInError, 
        // debounce(() => {
        //   formState.current.fieldTriggerInError = new Set();
        // }, 200)();
        const changedFieldName = formatName(changedField.name);
        //  && changedField.errors?.length
        if (fieldTriggerInError.has(changedFieldName)) {
            // clearErrorFlag && fieldTriggerInError.delete(changedFieldName);
            fieldTriggerInError.delete(changedFieldName);
            // console.log('tttt error clear');
            return;
        }
        // 获取依赖变化
        _subjects.deps.next({ name: changedField.name }, (ret) => {
            // console.log('tttttttttchanged trigger: ', ret)
            // 触发收集依赖的 field
            _subjects.state.trigger(ret, changedField);
        });
    }, [formState, _subjects]);
    const collectChangeFields = useCallback((changedFields) => {
        changedFields === null || changedFields === void 0 ? void 0 : changedFields.forEach((changedField) => {
            formState.current.queue.set(formatName(changedField.name), changedField);
        });
    }, [formState]);
    /**
     * 增加一个全局context存储库，用于特殊方法或变量的共享
    */
    if (!form.globalContext) {
        form.globalContext = new Map();
    }
    useEffect(() => {
        // 下面2个方法，简单的用一下，需要对该方案进行一个劫持
        if (form.setFieldValue) {
            const originSetFieldValue = form.setFieldValue;
            form.setFieldValue = (name, value, ignoreTrigger) => {
                // formState.current.hasInited = true;
                originSetFieldValue(name, value);
                // console.log('wwwwwww setFieldValue: ', name, value, ignoreTrigger);
                // TODO 有些默认值的操作，不需要造成联动校验
                if (ignoreTrigger) {
                    return;
                }
                _subjects.deps.next({ name }, (ret) => {
                    // 触发收集依赖的 field
                    _subjects.state.trigger(ret);
                });
                trigger({ name, touched: true });
            };
        }
        if (form.resetFields) {
            const originResetFields = form.resetFields;
            form.resetFields = (fields) => {
                formState.current.hasInited = true;
                // 标准用法，reset 指定fields
                if (Array.isArray(fields)) {
                    return originResetFields(fields);
                }
                else if (fields && isObject(fields)) {
                    // console.log('tttt,', mountTriggerCallbacks);
                    originResetFields();
                    mountTriggerCallbacks.forEach((callback) => {
                        callback();
                    });
                    return;
                }
                originResetFields();
            };
        }
        if (form.setFields) {
            const originSetFields = form.setFields;
            form.setFields = (...args) => {
                formState.current.hasInited = true;
                originSetFields(...args);
                args[0].forEach(({ name, value, errors }) => {
                    // TODO 如果是单纯的设置错误提示，不做联动校验触发
                    if (!value && Array.isArray(errors)) {
                        return;
                    }
                    // triggerProxy({ changedField: { name }, form });
                    trigger({
                        name,
                        touched: true,
                    });
                    // _subjects.deps.next({ name }, (ret) => {
                    //   // 触发收集依赖的 field
                    //   _subjects.state.trigger(ret);
                    // });
                });
            };
        }
        if (form.setFieldsValue) {
            const originSetFieldsValue = form.setFieldsValue;
            form.setFieldsValue = (args, ignoreTrigger) => {
                originSetFieldsValue(args);
                formState.current.hasInited = true;
                if (!ignoreTrigger) {
                    Object.keys(args).forEach((fieldName) => {
                        trigger({ name: fieldName, touched: true });
                    });
                }
            };
        }
        if (form.submit) {
            const originSubmit = form.submit;
            form.submit = (...args) => {
                formState.current.validating = true;
                originSubmit(...args);
            };
        }
        if (form.validateFields) {
            const originValidateFields = form.validateFields;
            // 这里的 validating 需要做一个延后 false，这里
            form.validateFields = (...args) => __awaiter(this, void 0, void 0, function* () {
                // formState.current.validating = true;
                const keys = Object.keys(args);
                if (keys.length === 0) {
                    console.log('wwww start validating');
                    formState.current.validating = true;
                }
                try {
                    // @ts-ignore
                    const [namPaths, from] = args;
                    if (from === 'fromWaform') {
                        // console.log('ttttt validated trigger from Waform');
                        args = [namPaths];
                    }
                    const res = yield originValidateFields(...args);
                    // 整批提交还是需要 debounce 一下，不然表单会一直触发(由于可能涉及异步接口校验，所以这个时间需要拉的很长)
                    !keys.length && debounce(() => {
                        console.log('wwww clear submit validating');
                        formState.current.validating = false;
                    }, 250)();
                    return res;
                }
                catch (error) {
                    // 采用 onFinishedFailed 事件定制错误回调的，这个 catch 就不会被触发
                    !keys.length && debounce(() => {
                        console.log('wwww clear error validating');
                        formState.current.validating = false;
                    }, 250)();
                    throw error;
                }
            });
        }
    }, []);
    if (!_formControl.current) {
        _formControl.current = {
            _subjects,
            register: _subjects.state.register,
            watch: (path, callback, options) => _subjects.deps.subscribe(Object.assign({ path,
                callback }, options)),
            mountTriggerCallbacks,
            // TODO: 可能拿不到 value
            getIn: (path) => {
                const values = form.getFieldsValue();
                return FormPath.parse(path).getIn(values);
            },
            formState,
            // validating: false,
            collectChangeFields,
            // trigger
            trigger,
            // TODO: 暂时先把 Form 挂这里
            form,
        };
    }
    return _formControl.current;
}
