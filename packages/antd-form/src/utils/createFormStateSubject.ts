import { ValidatorRule } from 'rc-field-form/lib/interface';
import { formatName } from '.';
import { Noop } from '../types';
import { DepsTriggerReturnData } from './createDepsSubject';
import { NamePath } from 'rc-field-form/lib/interface';
import { HFormInstance } from '../types/form';
// import generateValidator from '../logic/generateValidator';

export interface FormStateObserver {
  first: () => void;
  trigger: (params: DepsTriggerReturnData, changeField?: any) => void;
}

export type FormStateSubject = {
  readonly observers: Map<string, FormState>;
  register: (value: {
    name: NamePath;
    fullName?: NamePath;
    mounted?: boolean;
    rules?: ValidatorRule[];
  }) => FormStateSubscription;
  unregister: Noop;
} & FormStateObserver;

export interface FormStateSubscription {
  unregister: Noop;
  updateState: Noop;
}

interface FormState {
  id: string;
  // 传入的原始 fieldName
  name: NamePath;
  // 全路径
  fullName?: NamePath;
  rules?: ValidatorRule[];
  // 是否已挂载
  mounted?: boolean;
  // 更新次数
  _modify_rules_count: number;
}

export default function createFormStateSubject(form: HFormInstance): FormStateSubject {
  const _observers = new Map<string, FormState>();

  const trigger: FormStateObserver['trigger'] = (values, changeField?: any) => {
    const { name, entire, segments, matched } = values;
    const id = formatName(name);

    // 要被触发的 field name
    if (_observers.has(id)) {
      const observer = _observers.get(id);

      // !observer?.mounted && console.log('ttttt mounted status: unmounted');
      
      if (observer?.mounted && observer?.rules && observer?.rules?.length) {
        // generateValidator(observer?.rules, {
        //   dep: {
        //     entire,
        //     segments,
        //     by: matched,
        //   },
        //   form,
        //   getValue: (n: NamePath) => form.getFieldValue(n),
        // });
        // console.log('ttttt validated trigger', name);
        // @ts-ignore
        form.validateFields([name], 'fromWaform')
          // 这里吃掉 抛出去的 error
          .catch(() => {}); // TODO 这里catch 掉的意义什么？
      }
    }
  };

  /**
   * 校验到第一个就停止
   */
  const first = () => {};

  const register: FormStateSubject['register'] = (
    observer,
  ): FormStateSubscription => {
    const { name, fullName, rules, mounted = true } = observer;

    const id = formatName(name);

    if (!_observers.has(id)) {
      const data = {
        id,
        rules,
        // 原始传入的 name
        name,
        // name 的filed 完整路径
        fullName,
        // 是否已挂载
        mounted,
        _modify_rules_count: 0,
      };

      _observers.set(id, data);
    } else {
      const currentState = _observers.get(id) as FormState;

      const nextState: FormState = {
        ...currentState,
        mounted: true,
      };

      // 更新 rules
      // if (!isEqual(currentState.rules, rules)) {
      //   nextState._modify_rules_count = 1 + currentState._modify_rules_count;
      //   nextState.rules = rules;
      // }

      _observers.set(id, nextState);
    }

    return {
      unregister: () => {},
      updateState: (props = {}) => {
        const _curState = _observers.get(id);
        _observers.set(id, {
          ..._curState,
          ...props,
        });
      }
    };
  };

  const unregister = () => {
    _observers.clear();
  };

  return {
    get observers() {
      return _observers;
    },
    trigger,
    first,
    register,
    unregister,
  };
}
