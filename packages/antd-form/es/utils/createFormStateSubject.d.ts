import { ValidatorRule } from 'rc-field-form/lib/interface';
import { Noop } from '../types';
import { DepsTriggerReturnData } from './createDepsSubject';
import { NamePath } from 'rc-field-form/lib/interface';
import { HFormInstance } from '../types/form';
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
    name: NamePath;
    fullName?: NamePath;
    rules?: ValidatorRule[];
    mounted?: boolean;
    _modify_rules_count: number;
}
export default function createFormStateSubject(form: HFormInstance): FormStateSubject;
export {};
