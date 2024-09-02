import { NamePath } from 'rc-field-form/lib/interface';
import { DepsTriggerReturnData } from '../utils/createDepsSubject';
import { HFormInstance } from './form';

export type InteractiveSetPropsType = Record<string, any>;

export interface InteractiveMethods extends DepsTriggerReturnData {
  /**
   * 待定
   */
  form: HFormInstance;
  /**
   * 设置 子元素 的 props，增量merge
   * @param data Props
   */
  setProps: (props: InteractiveSetPropsType) => void;
  /**
   * 设置 可遍历孙子元素的 的 props，增量merge, 仅Custom 组件有用
   * @param data Props
   */
  setChildProps?: (props: InteractiveSetPropsType) => void;
  /**
   * 设置 formitem 的 value
   * @param data Props
   */
  setValue: (value: any) => void;
  /**
   * 设置 formitem 的显隐
   * @param data Props
   */
  setVisible: (visible: boolean) => void;

  /**
   * 例子
   * deps = ['name', 'age', 'list.*.price']
   *  1. getValue('name')
   *  2. getValue('list.1.price') -> 该路径会由 entire 返回
   * @param path deps 匹配上的 路径，不能传入模糊路径
   * @returns
   */
  getValue: (path: NamePath) => any;

  /**
   * 例子
   * deps = ['name', 'age', 'list.*.price']
   *  1. isDep('name')
   *  2. isDep('list.*.price')
   * @param depPath deps 中的 单个项
   * @returns boolean
   */
  isDep: (depPath: string) => boolean;
}

export type InteractiveCustomMethods = InteractiveMethods;

export type InteractiveVisibleMethods = Omit<InteractiveMethods, 'setProps' | 'setValue' | 'setVisible'>;
