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
import React, { useState, useRef, useCallback, useEffect, } from 'react';
import { useFormContext } from '../../hooks/useFormContext';
import { formatName, formatedArrStrToArr } from '../../utils';
import parse, { parseRules } from '../../rule-engine/parse';
// import { createAction } from '../../utils/createAction';
const noop = (args) => false;
const Custom = (props) => {
    var _a, _b, _c, _d, _e, _f, _g;
    const methods = useFormContext();
    // TODO: 需要改为泛型
    const { watch, trigger, form, actions = {}, formState, schemaEditMode, context, mountTriggerCallbacks, actionCallback } = methods;
    const contextRef = useRef({});
    const { children, schemaMode = false, 
    // 默认挂载
    visible = true, action: privateAction, triggerOnMounted = false, triggerDepsWithVisible = false, importMethods = {}, } = props;
    // let triggerDepsWithVisibleEnable = triggerDepsWithVisible;
    const finalMethods = Object.assign(methods.importMethods || {}, importMethods);
    if (children == null) {
        throw new Error('Children is required.');
    }
    // 单节点校验
    if (!React.Children.only(children)) {
        throw new Error('Children is only one.');
    }
    /**
     * 这里取出来的是 default props
     * 也就是：
     * <div>
     *  <FormItem
     *    ...props
     *  >
     *    ...
     *  </FormItem>
     * </div>
     */
    const [_props, _setProps] = useState(children.props);
    // let childDisableSet;
    const hasEnabledSetChildProps = !!((_a = children.props) === null || _a === void 0 ? void 0 : _a.children);
    // 多节点类型
    const hasMultiDescendantNode = hasEnabledSetChildProps && Array.isArray(children.props.children) && children.props.children.length > 1;
    // 子组件 props
    const [_childProps, _setChildProps] = useState(hasMultiDescendantNode ? children.props.children[0].props : ((_b = children.props.children) === null || _b === void 0 ? void 0 : _b.props) || {});
    // 收集triggerDepsWithVisible 的设定状态
    const complexPropsRef = useRef({
        triggerDepsWithVisible
    });
    const actionsRef = useRef({
        form,
        context,
        props: _props,
        changedProps: {},
        childProps: _childProps,
        changedChildProps: undefined,
    });
    const initFlagRef = useRef();
    // 一直更新，防止闭包
    actionsRef.current.context = Object.assign(contextRef.current, context);
    const { name, fullName } = children.props;
    if (name == null) {
        throw new Error('Field name is required.');
    }
    const formatedName = formatName(fullName || name);
    if (privateAction) {
        let validAction = typeof privateAction === 'object' ? Object.assign({}, privateAction) : privateAction;
        if (schemaMode && !initFlagRef.current) {
            validAction = {};
            const _h = privateAction, { rules, required = false, triggerDepsWithVisible = false, change = [], deps = [], requiredMessage } = _h, others = __rest(_h, ["rules", "required", "triggerDepsWithVisible", "change", "deps", "requiredMessage"]);
            Object.assign(validAction, others);
            validAction.deps = deps.map(formatedArrStrToArr);
            if (required || (rules && ((_c = rules.caseItems) === null || _c === void 0 ? void 0 : _c.length))) {
                validAction.rules = schemaEditMode ? [{ required, message: requiredMessage }] : parseRules({
                    form,
                    required,
                    fieldName: name,
                    rules,
                    context,
                    methods: finalMethods,
                    requiredMessage
                });
                // 这里生成的信息 包含了 required 信息
                if (validAction.rules.length) {
                    // @ts-ignore
                    actionsRef.current.changedProps.rules = validAction.rules;
                }
            }
            // 筛选出 固定置灰, 暂时不需要了，这个设计就是个伪命题
            // const validChanges = change.filter((item) => !(item.type === 'disable' && item.disabled === 'disabled'));
            // childDisableSet = false;
            // 有筛选出结果，说明有固定置灰配置
            // if (validChanges.length !== change.length) {
            //   childDisableSet = true;
            // }
            // 先不要去触发联动
            validAction.onChange = schemaEditMode ? noop : parse({
                methods: finalMethods,
                fieldName: name,
                context: actionsRef.current.context,
                changes: change,
            });
            complexPropsRef.current.triggerDepsWithVisible = triggerDepsWithVisible;
            initFlagRef.current = validAction;
        }
        // 修正装修模式下，必填校验被反复切换的问题
        if (schemaEditMode && initFlagRef.current) {
            const { required = false, requiredMessage } = privateAction;
            // 切换了必填校验
            if ((required && (!((_e = (_d = initFlagRef.current.rules) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.required))) || (!required && ((_g = (_f = initFlagRef.current.rules) === null || _f === void 0 ? void 0 : _f[0]) === null || _g === void 0 ? void 0 : _g.required))) {
                initFlagRef.current.rules = [{ required, message: requiredMessage }];
                // @ts-ignore
                actionsRef.current.changedProps.rules = initFlagRef.current.rules;
            }
        }
        // 下发的action是可以覆盖的
        actions[formatedName] = initFlagRef.current || validAction;
    }
    let action = actions[formatedName];
    // 这里还有优化的空间
    if (typeof action === 'function') {
        actions[formatedName] = action(actionsRef.current);
        action = actions[formatedName];
    }
    if (!action) {
        throw new Error(`Field <${formatedName}> action is required.`);
    }
    // TODO: 这里的各种 visible 还要调整下
    const [_visible, _setVisible] = useState(visible);
    const _stateRef = useRef({
        visible: _visible,
    });
    const setVisible = useCallback((value) => {
        const nextVisible = !!value;
        _setVisible(nextVisible);
        actionCallback && actionCallback('visible', nextVisible, {
            name,
        });
        // 有显隐变化
        if (complexPropsRef.current.triggerDepsWithVisible && _stateRef.current.visible !== nextVisible) {
            // 延迟一轮
            Promise.resolve().then(() => {
                trigger({
                    name,
                    touched: true
                });
            });
        }
        _stateRef.current.visible = nextVisible;
    }, []);
    const setProps = useCallback((values) => {
        const next = Object.assign({}, actionsRef.current.props, values);
        actionsRef.current.changedProps = Object.assign(actionsRef.current.changedProps, values);
        actionsRef.current.props = next;
        _setProps(next);
    }, [actionsRef]);
    const setChildProps = useCallback((values) => {
        if (!hasEnabledSetChildProps) {
            console.error('节点：', name, '不具备可遍历的叶子节点，故该API不可用');
            return;
        }
        const next = Object.assign({}, actionsRef.current.childProps, values);
        actionsRef.current.changedChildProps = Object.assign(actionsRef.current.changedChildProps || {}, values);
        actionsRef.current.childProps = next;
        _setChildProps(next);
    }, [actionsRef]);
    const setDisabled = useCallback((disabled) => {
        setChildProps({ disabled: !!disabled });
    }, [actionsRef]);
    const setValue = useCallback((value) => {
        // @ts-ignore
        form.setFieldValue(name, value);
    }, [name]);
    const onChangeMethods = ({ entire, segments, matched, type }) => {
        return [
            Object.assign(Object.assign({ setVisible,
                setProps,
                setChildProps,
                setDisabled,
                setValue,
                name,
                entire,
                segments,
                type }, actionsRef.current), { isDep: (depPath) => {
                    return matched === undefined ? false : depPath === matched;
                }, getFieldsValue: form.getFieldsValue, getFieldValue: form.getFieldValue, getValue: form.getFieldValue }),
            children.props,
        ];
    };
    useEffect(() => {
        let onChange = (action === null || action === void 0 ? void 0 : action.onChange) || noop;
        let w;
        // 只有填了依赖的，才需要注册监听
        if (Array.isArray(action.deps) && action.deps.length) {
            w = watch(action.deps, ({ entire, segments, matched }) => {
                onChange === null || onChange === void 0 ? void 0 : onChange(...onChangeMethods({ entire, segments, matched }));
            }, {
                name: fullName || name,
                state: _stateRef.current,
                hooks: action.hooks,
            });
        }
        // 需要在组件 mounted 的时候直接进行一次触发
        if (onChange && (triggerOnMounted || schemaMode)) {
            mountTriggerCallbacks.push(() => {
                onChange(...onChangeMethods({ entire: '', segments: [], type: 'mounted' }));
            });
            // schema 模式, 挂载时不执行，仅在 resetFields 时触发一次
            if (triggerOnMounted || (schemaMode && formState.current.hasInited)) {
                onChange(...onChangeMethods({ entire: '', segments: [], type: 'mounted' }));
            }
        }
        return () => {
            // console.log('ttttt custom umounted');
            w && w.unsubscribe();
        };
    }, []);
    if (!_visible) {
        return null;
    }
    return React.Children.map(children, (child) => {
        let changeProps = {};
        let _child = child;
        // 如果有使能 setChildProps， 且childProps有变化
        if (hasEnabledSetChildProps && actionsRef.current.changedChildProps) {
            let [firstChild, ...others] = hasMultiDescendantNode ? _child.props.children : [_child.props.children];
            firstChild = Object.assign(Object.assign({}, firstChild), { props: Object.assign(Object.assign({}, firstChild.props), actionsRef.current.changedChildProps) });
            changeProps.children = hasMultiDescendantNode ? [
                firstChild,
                ...others,
            ] : firstChild;
        }
        return React.cloneElement(_child, Object.assign(Object.assign(Object.assign({}, (_child.props || {})), actionsRef.current.changedProps), changeProps));
    });
};
export default Custom;
