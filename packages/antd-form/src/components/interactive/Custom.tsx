import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
} from 'react';
import { useFormContext } from '../../hooks/useFormContext';
import { HFormActionFunc, HFormCustomAction } from '../../types';
import { formatName, formatedArrStrToArr } from '../../utils';
import { UseFormReturn } from '../../hooks/useForm';
import { DepsTriggerReturnData } from '../../utils/createDepsSubject';
import parse, { parseRules } from '../../rule-engine/parse';
import { AnyObject } from '../../rule-engine/interface';
// import { createAction } from '../../utils/createAction';

const noop = (args: any) => false;

export interface TSchemaAction {
  change: any[];
  deps: string[];
  changeValidate?: boolean;
  required?: false;
  triggerDepsWithVisible?: boolean;
  requiredMessage?: string;
  rules?: { caseItems: any; };
}
export interface InteractiveCustomProps {
  action?: HFormCustomAction;
  /**
   * deps 触发变化的时候会触发 onChange
   * @param value
   * @param methods
   * @returns
   */
  // onChange: (value: any, methods: InteractiveCustomMethods) => void;
  visible?: boolean;
  // 隐藏表单，而不是不渲染
  hidden?: boolean;
  // 挂载时触发mounted
  triggerOnMounted?: boolean;
  // 如果有显隐联动，可触发被依赖项的联动
  triggerDepsWithVisible?: boolean;
  // visible 是外部受控 还是 内部受控, 默认为内部受控
  vmode?: 'out' | 'in';
  children?: JSX.Element;
  unControlProps?: string[];
  // 装修平台 schema 渲染模式
  schemaMode?: boolean;
  // 装修平台 schema 编辑模式
  schemaEditMode?: boolean;
  // 导入的方法集合，schema 模式用;
  importMethods?: AnyObject;
}

const Custom: React.FC<InteractiveCustomProps> = (props): any => {
  const methods = useFormContext();

  // TODO: 需要改为泛型
  const { watch, trigger, form, actions = {}, formState, schemaEditMode, context, mountTriggerCallbacks, actionCallback } = methods as {
    actions: any;
    context: UseFormReturn['context'];
    watch: UseFormReturn['watch'];
    trigger: UseFormReturn['trigger'];
    form: UseFormReturn['form'];
    formStatus: UseFormReturn['formStatus'];
    formState: UseFormReturn['formState'];
    schemaEditMode?: UseFormReturn['schemaEditMode'];
    mountTriggerCallbacks: UseFormReturn['mountTriggerCallbacks'];
    actionCallback?: UseFormReturn['actionCallback']
    importMethods?: AnyObject;
  };

  const contextRef = useRef<AnyObject>({});

  const {
    children,
    schemaMode = false,
    // 默认挂载
    visible = true,
    action: privateAction,
    triggerOnMounted = false,
    triggerDepsWithVisible = false,
    importMethods = {},
  } = props;

  // let triggerDepsWithVisibleEnable = triggerDepsWithVisible;
  const finalMethods = Object.assign(methods.importMethods || {}, importMethods)

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
  const hasEnabledSetChildProps = !!children.props?.children;
  // 多节点类型
  const hasMultiDescendantNode = hasEnabledSetChildProps && Array.isArray(children.props.children) && children.props.children.length > 1;
  // 子组件 props
  const [_childProps, _setChildProps] = useState(hasMultiDescendantNode ? children.props.children[0].props : children.props.children?.props || {});

  // 收集triggerDepsWithVisible 的设定状态
  const complexPropsRef = useRef<AnyObject>({
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

  const initFlagRef = useRef<AnyObject>();
  // 一直更新，防止闭包
  actionsRef.current.context = Object.assign(contextRef.current, context);

  const { name, fullName } = children.props;

  if (name == null) {
    throw new Error('Field name is required.');
  }

  const formatedName = formatName(fullName || name);

  if (privateAction) {
    let validAction: AnyObject = typeof privateAction === 'object' ? { ...privateAction } : privateAction;
    if (schemaMode && !initFlagRef.current) {
      validAction = {};
      const { rules, required = false, triggerDepsWithVisible = false, change = [], deps = [], requiredMessage, ...others } = privateAction as TSchemaAction;
      Object.assign(validAction, others);

      validAction.deps = deps.map(formatedArrStrToArr);
      if (required || (rules && rules.caseItems?.length)) {
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
      const { required = false, requiredMessage } = privateAction as TSchemaAction;

      // 切换了必填校验
      if ((required && (!initFlagRef.current.rules?.[0]?.required)) || (!required && initFlagRef.current.rules?.[0]?.required)) {
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
    actions[formatedName] = (action as HFormActionFunc)(actionsRef.current);
    action = actions[formatedName] as HFormCustomAction;
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

  const setProps = useCallback(
    (values) => {
      const next = Object.assign({}, actionsRef.current.props, values);
      actionsRef.current.changedProps = Object.assign(actionsRef.current.changedProps, values);
      actionsRef.current.props = next;
      _setProps(next);
    },
    [actionsRef],
  );

  const setChildProps = useCallback(
    (values) => {
      if (!hasEnabledSetChildProps) {
        console.error('节点：', name, '不具备可遍历的叶子节点，故该API不可用');
        return;
      }
      const next = Object.assign({}, actionsRef.current.childProps, values);
      actionsRef.current.changedChildProps = Object.assign(actionsRef.current.changedChildProps || {}, values);

      actionsRef.current.childProps = next;
      _setChildProps(next);
    },
    [actionsRef],
  );

  const setDisabled = useCallback(
    (disabled: boolean) => {
      setChildProps({ disabled: !!disabled });
    },
    [actionsRef],
  );

  const setValue = useCallback(
    (value) => {
      // @ts-ignore
      form.setFieldValue(name, value);
    },
    [name],
  );

  const onChangeMethods = ({ entire, segments, matched, type }: Partial<Pick<DepsTriggerReturnData, 'entire' | 'segments' | 'matched' | 'type'>>) => {
    return [
      {
        setVisible,
        setProps,
        setChildProps,
        setDisabled,
        setValue,
        name,
        entire,
        segments,
        type,
        // form, ref, props
        ...actionsRef.current,
        isDep: (depPath: string) => {
          return matched === undefined ? false : depPath === matched;
        },
        getFieldsValue: form.getFieldsValue,
        getFieldValue: form.getFieldValue,
        getValue: form.getFieldValue,
      },
      children.props,
    ];
  };

  useEffect(() => {
    let onChange = action?.onChange || noop;

    let w;
    // 只有填了依赖的，才需要注册监听
    if (Array.isArray(action.deps) && action.deps.length) {
      w = watch(
        action.deps,
        ({ entire, segments, matched }) => {
          onChange?.(...onChangeMethods({ entire, segments, matched }));
        },
        {
          name: fullName || name,
          state: _stateRef.current,
          hooks: action.hooks,
        },
      );
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

  return React.Children.map(children, (child: JSX.Element) => {
    let changeProps: Record<string, any> = {};

    let _child = child;

    // 如果有使能 setChildProps， 且childProps有变化
    if (hasEnabledSetChildProps && actionsRef.current.changedChildProps) {
      let [firstChild, ...others] = hasMultiDescendantNode ? _child.props.children : [_child.props.children];

      firstChild = {
        ...firstChild,
        props: {
          ...firstChild.props,
          ...actionsRef.current.changedChildProps,
        },
      };

      changeProps.children = hasMultiDescendantNode ? [
        firstChild,
        ...others,
      ] : firstChild;
    }

    return React.cloneElement(_child, {
      ...(_child.props || {}),
      ...actionsRef.current.changedProps,
      ...changeProps,
    });
  });
};

export default Custom;
