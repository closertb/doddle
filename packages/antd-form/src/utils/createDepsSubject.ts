import { Segments } from '@formily/path/esm/types';
import { eachPath, formatName } from '.';
import { Deps, Noop } from '../types';
import { matchPath } from './path';
import { NamePath } from 'rc-field-form/lib/interface';

interface DepItem {
  id: string;
  name: NamePath;
  state?: Record<string, any>;
}

export interface DepsTriggerReturnData {
  // 匹配到依赖触发的位置，也就是 deps 中具体哪个触发了
  matched: string;
  /**
   * 由 watch 方法返回的当前被match 到的 dep，如果是 模糊path，则会返回带 index 位置
   * list.*.price -> list.1.price
   */
  entire: string;
  /**
   * entire 对应的数组格式
   * dep: [a, *, b]
   */
  segments: Segments;
  // mounted
  type?: 'mounted' | 'unmounted' | 'others';
  /**
   * FieldName
   */
  name: NamePath;
  // 触发的Field
  changeField?: any;
  // 表单用户自定义上下文
  context?: Record<string, any>;
  // props，组件属性
  props?: Record<string, any>;
}

export interface FieldsValue {
  callback: (methods: DepsTriggerReturnData) => void;
  hooks?: {
    beforeRules?: (params: DepsTriggerReturnData, state: DepItem['state']) => boolean;
  };
}

export interface DepsObserver {
  next: (
    params: { name: NamePath },
    onTrigger?: (params: DepsTriggerReturnData) => void
  ) => void;
}

export type DepsSubject = {
  readonly observers: Map<string, DepItem[]>;
  subscribe: (value: {
    path: Deps;
    callback: FieldsValue['callback'];
    name: string | string[];
    state?: DepItem['state'];
    hooks?: FieldsValue['hooks'];
  }) => DepsSubscription;
  unsubscribe: Noop;
} & DepsObserver;

export interface DepsSubscription {
  unsubscribe: Noop;
}

export default function createSubject(): DepsSubject {
  /**
   * 数据项（Field）发生变化的时候，需要查找谁在依赖自己的 Change
   * 例如：
   *  逻辑：chengzi 依赖于 deo 下 price 字段 （deo.*.price） 的变化
   *  即：（deo.*.price）触发 chengzi 的交互逻辑
   *  <Custom
   *    deps=['deo.*.price']
   *  >
   *    <FormItem name="chengzi" />
   *  </Custom>
   *
   *  <FormList
   *     name="deo"
   *  >
   *    for {
   *      <FormItem name={[field.name, 'price']} />
   *    }
   *  </FormList>
   *  1. Dep Field Path:
   *    数组项：name={[field.name, 'age']} 发生变化-> *(deo.*.age)
   *  2. Dep Field Path: ['wanwu'] -> wanwu
   *
   * 储存逻辑：
   *  Map<
   *    string(
   *      deo.*.age // dep
   *    ),
   *    Array<
   *      chengzi, // filedName
   *      ...,
   *    >
   *  >
   *
   * 卸载逻辑
   *  1. 如果 chengzi 被卸载，那么需要通知 deo.*.price 取消对 chengzi 的监听
   */
  const _deps = new Map<string, DepItem[]>();

  /**
   * 这里存储 filed 在依赖变更下的 onChange 回调
   * 例如：chengzi -> fn.onChange
   *  <Custom
   *    deps=['deo.*.price']
   *    onChange={() => { ... }}
   *  >
   *    <FormItem name="chengzi" />
   *  </Custom>
   */
  const _fields = new Map<string, FieldsValue>();

  /**
   * 这里的 name 是 filed 实际触发的位置，外部需要转换为 deo.0.price 此类格式
   * @param param name changedFiledName
   */
  const next: DepsObserver['next'] = ({ name }, onTrigger) => {
    const id = formatName(name);

    /**
     * 这里的 fields 是 _deps 的 value 里面存储的依赖 dep 的字段集合
     *
     * 注意：这里 _deps 和 _fields 之间的 是通过 formatName 后的 id 来进行对应关系的查找
     */
    _deps.forEach((fields, dep) => {
      const paths = matchPath(dep, id);

      if (paths !== null) {
        fields.forEach(async (field) => {
          // dep 的动作触发 field 的 onChange 的交互逻辑
          // 这里是其实是要被触发的 field name
          if (_fields.has(field.id)) {
            const triggers = _fields.get(field.id);

            const ret: DepsTriggerReturnData = {
              // 匹配到依赖触发的位置
              matched: dep,
              // a.*.b
              entire: paths.entire,
              // [a, *, b]
              segments: paths.segments,
              // 需要被触发的 field
              name: field.name,
            };
            // console.log('tttttt', field.id, triggers);
            
            // 先触发绑定的 onChange 回调， 后触发校验
            triggers?.callback?.(ret);

            // 由于被触发的节点还在挂载中，所以这时需要延迟触发
            // setTimeout(() => {
              if (triggers?.hooks) {
                const beforeRulesValue = triggers?.hooks?.beforeRules?.(ret, field.state);

                if (beforeRulesValue === false) {
                  return;
                }
              }

              // 默认逻辑，如果 fields 被隐藏了则不需要进行触发校验
              if (triggers?.hooks?.beforeRules == null && !field.state?.visible) return;

              /**
               * 触发给到 deps next 的回调
               * _subjects.deps.next({ name: changedField.name }, (ret) => {
               *  _subjects.state.trigger(ret, changedField);
               * });
               */
              onTrigger?.(ret);
            // }, 0);
          }
        });
      }
    });

    // console.log('tttttt _deps', _deps.size);
    
  };

  const subscribe: DepsSubject['subscribe'] = (observer): DepsSubscription => {
    // state: 为监听的一些内部状态
    const { path, name, callback, state, hooks } = observer;

    /**
     * 这里将 name: NamePath 转换后当成 key 来存储
     */
    const id = formatName(name);

    eachPath(path, p => {
      if (!_deps.has(p)) {
        _deps.set(p, []);
      }

      const index = _deps.get(p)?.findIndex(n => n.id === id);

      if (index === -1) {
        _deps.get(p)?.push({
          id,
          name,
          state,
        });
      }
    });

    if (!_fields.has(id)) {
      _fields.set(id, {
        callback,
        hooks,
      });
    }

    return {
      unsubscribe: () => {
        // 在各个依赖项清空自己
        eachPath(observer.path, (p) => {
          if (_deps.has(p)) {
            const nextValue = _deps.get(p)?.filter(n => n.id !== id) || [];
            _deps.set(p, nextValue);
            _fields.delete(id);
          }
        });
      },
    };
  };

  /**
   * 清空整个表单的所有监听
   */
  const unsubscribe = () => {
    _deps.clear();
    _fields.clear();
  };

  return {
    get observers() {
      return _deps;
    },
    next,
    subscribe,
    unsubscribe,
  };
}
