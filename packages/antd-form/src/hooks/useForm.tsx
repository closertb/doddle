import React, { useCallback, useEffect, useMemo } from 'react';
import { FormPath } from '@formily/core';
import { debounce, isObject } from 'lodash-es';
import { NamePath } from 'rc-field-form/lib/interface';
import { Subjects, HFormCustomAction } from '../types';

import createDepsSubject, { DepsSubscription, FieldsValue } from '../utils/createDepsSubject';
import createFormStateSubject, { FormStateSubject } from '../utils/createFormStateSubject';
import { formatName } from '../utils';
import { HFormInstance } from '../types/form';
import { AnyObject } from '../rule-engine/interface';

interface UseFormProps {
  form: HFormInstance;
}

export interface UseFormReturn {
  /**
   * 手动注册
   */
  register: FormStateSubject['register'];

  /**
   * 整个监听
   */
  _subjects: Subjects;

  /**
   * deps 变化监听器
   * @param path deps path
   * @param callback 触发 deps 的回调
   * @param options
   *  name: Custom 包裹的 FormItem name
   * @returns DepsSubscription
   */
  watch: (
    path: string | string[],
    callback: FieldsValue['callback'],
    options: {
      name: string | string[];
      state?: Record<string, any>;
      hooks?: FieldsValue['hooks'];
    }
  ) => DepsSubscription;

  /**
   * formState 的内部状态
   */
  formState: Record<string, any>;

  // 编辑态 还是详情态
  formStatus?: 'view' | 'edit';

  /**
   * TODO:
   * @param path
   * @returns
   */
  getIn: (path: string) => any;

  validating?: boolean;

  form: UseFormProps['form'];

  mountTriggerCallbacks?: (() => void)[];

  collectChangeFields: (fields: any) => void;

  trigger: (field: any, clearErrorFlag?: boolean) => void;

  actions?: Record<string, HFormCustomAction>;

  children?: React.ReactElement;

  context?: Record<string, any>;

  // 以下字段为装修模式专用
  schemaEditMode?: boolean;
  // 导入的方法集合，schema模式专用
  importMethods?: AnyObject;
  // 联动触发后的回调函数
  actionCallback?: (actionType: string, result: any, options: {
    // 被触发联动项的 name
    name: NamePath;
    [prop: string]: any;
  }) => void
}

export function useForm(props: UseFormProps): UseFormReturn {
  const _formControl = React.useRef<UseFormReturn>();
  const mountTriggerCallbacks = [];
  const formState = React.useRef({
    validating: false,
    // 表单是否初始化完成
    hasInited: false,
    queue: new Map<string, any>(),
    fieldTriggerInError: new Set<string>(),
  });
  const { form } = props;

  const _subjects: Subjects = useMemo(() => ({
    deps: createDepsSubject(),
    state: createFormStateSubject(form),
  }), [form]);

  const trigger = useCallback((changedField: any, clearErrorFlag?: boolean) => {
    const fieldTriggerInError = formState.current.fieldTriggerInError;
    if (!changedField.touched) {
      return;
    }

    if (changedField.validating) {
      fieldTriggerInError.add(formatName(changedField.name))
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

  }, [formState, _subjects])
  const collectChangeFields = useCallback((changedFields: Record<string, any>) => {
    changedFields?.forEach((changedField) => {
      formState.current.queue.set(formatName(changedField.name), changedField);
    });
  }, [formState]);

  /**
   * 增加一个全局context存储库，用于特殊方法或变量的共享
  */
  if (!form.globalContext) {
    form.globalContext = new Map<string, any>();
  }

  useEffect(() => {
    // 下面2个方法，简单的用一下，需要对该方案进行一个劫持
    if (form.setFieldValue) {
      const originSetFieldValue = form.setFieldValue;

      form.setFieldValue = (name: NamePath, value: any, ignoreTrigger?: boolean) => {
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
        trigger({ name, touched: true })
      };
    }

    if (form.resetFields) {
      const originResetFields = form.resetFields as any;
      form.resetFields = (fields: any[] | Record<string, any>) => {
        formState.current.hasInited = true;
        // 标准用法，reset 指定fields
        if (Array.isArray(fields)) {
          return originResetFields(fields);
        } else if(fields && isObject(fields)) {
          // console.log('tttt,', mountTriggerCallbacks);
          originResetFields();
          mountTriggerCallbacks.forEach((callback) => {
            callback();
          });
          return 
        }
        originResetFields();
      }
    }

    if (form.setFields) {
      const originSetFields = form.setFields as any;

      form.setFields = (...args: any[]) => {
        formState.current.hasInited = true;
        originSetFields(...args);
        args[0].forEach(({ name, value, errors }: any) => {
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

      form.setFieldsValue = (args: any[], ignoreTrigger?: boolean) => {
        originSetFieldsValue(args);
        formState.current.hasInited = true;
        if (!ignoreTrigger) {
          Object.keys(args).forEach((fieldName) => {
            trigger({ name: fieldName, touched: true })
          });
        }
      };
    }

    if (form.submit) {
      const originSubmit = form.submit;
      form.submit = (...args) => {
        formState.current.validating = true;
        originSubmit(...args);
      }
    }

    if (form.validateFields) {
      const originValidateFields = form.validateFields;
      // 这里的 validating 需要做一个延后 false，这里
      form.validateFields = async (...args) => {
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

          const res = await originValidateFields(...args);

          // 整批提交还是需要 debounce 一下，不然表单会一直触发(由于可能涉及异步接口校验，所以这个时间需要拉的很长)
          !keys.length && debounce(() => {
            console.log('wwww clear submit validating');
            formState.current.validating = false;
          }, 250)();
          return res;
        } catch (error) {
          // 采用 onFinishedFailed 事件定制错误回调的，这个 catch 就不会被触发
          !keys.length && debounce(() => {
            console.log('wwww clear error validating');
            formState.current.validating = false;
          }, 250)();

          throw error;
        }
      };
    }
  }, []);

  if (!_formControl.current) {
    _formControl.current = {
      _subjects,

      register: _subjects.state.register,
      watch: (path, callback, options) => _subjects.deps.subscribe({
        path,
        callback,
        ...options,
      }),
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
