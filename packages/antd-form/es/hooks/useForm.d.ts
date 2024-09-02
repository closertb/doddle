import React from 'react';
import { NamePath } from 'rc-field-form/lib/interface';
import { Subjects, HFormCustomAction } from '../types';
import { DepsSubscription, FieldsValue } from '../utils/createDepsSubject';
import { FormStateSubject } from '../utils/createFormStateSubject';
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
    watch: (path: string | string[], callback: FieldsValue['callback'], options: {
        name: string | string[];
        state?: Record<string, any>;
        hooks?: FieldsValue['hooks'];
    }) => DepsSubscription;
    /**
     * formState 的内部状态
     */
    formState: Record<string, any>;
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
    schemaEditMode?: boolean;
    importMethods?: AnyObject;
    actionCallback?: (actionType: string, result: any, options: {
        name: NamePath;
        [prop: string]: any;
    }) => void;
}
export declare function useForm(props: UseFormProps): UseFormReturn;
export {};
