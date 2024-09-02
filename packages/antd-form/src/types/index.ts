import { InternalRuleItem, RuleItem, SyncValidateResult, ValidateOption, Value, Values } from 'async-validator';
import { NamePath } from 'rc-field-form/lib/interface';
import {
  InteractiveCustomMethods,
  InteractiveVisibleMethods,
} from './interactive';
import { DepsSubject, DepsTriggerReturnData, FieldsValue } from '../utils/createDepsSubject';
import { FormStateSubject } from '../utils/createFormStateSubject';
import { HFormInstance } from './form';

export type Path = string;

export type Deps = Path | Path[];

export type Noop = (...args: any[]) => void;

export interface Subjects {
  deps: DepsSubject;
  state: FormStateSubject;
}

interface HFormInternalRuleItem extends InternalRuleItem {
  dep?: DepsTriggerReturnData;
  getValue?: (name: NamePath) => any;
}

export interface HFormRuleItem extends Omit<RuleItem, 'validator'> {
  validator?: (
    rule: HFormInternalRuleItem,
    value: Value,
    callback: (error?: string | Error) => void,
    source: Values,
    options: ValidateOption,
  ) => SyncValidateResult | void; // eslint-disable-line
}

export type HFormRule = HFormRuleItem | HFormRuleItem[];

export type HFormActionFunc = (actionContext: {
    form: HFormInstance;
    props: Record<string, any>;
    context: InteractiveCustomMethods['context'];
  }
) => ActionsRef;

export interface ActionsRef {
  deps: string[];
  onChange?: (
    methods: InteractiveCustomMethods,
    props?: Record<string, any>,
  ) => any;
  rules?: HFormRule;
}

export interface HFormVisibleAction {
  deps: string[];
  onChange?: (
    methods: InteractiveVisibleMethods,
    props?: Record<string, any>,
  ) => any;
}

export interface HFormCustomAction {
  deps: string[];
  hooks?: FieldsValue['hooks'];
  onChange?: (
    methods: InteractiveCustomMethods,
    props?: Record<string, any>,
  ) => void;
  rules?: HFormRule;
}

export type HFormCustomFuncAction = (context: {
  form: HFormInstance;
  props: Record<string, any>;
  context: Record<string, any>;
}
) => HFormCustomAction;

export interface ActionsGroup {
  [props: string]: HFormCustomAction;
}
