import { Segments } from '@formily/path/esm/types';
import { Deps, Noop } from '../types';
import { NamePath } from 'rc-field-form/lib/interface';
interface DepItem {
    id: string;
    name: NamePath;
    state?: Record<string, any>;
}
export interface DepsTriggerReturnData {
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
    type?: 'mounted' | 'unmounted' | 'others';
    /**
     * FieldName
     */
    name: NamePath;
    changeField?: any;
    context?: Record<string, any>;
    props?: Record<string, any>;
}
export interface FieldsValue {
    callback: (methods: DepsTriggerReturnData) => void;
    hooks?: {
        beforeRules?: (params: DepsTriggerReturnData, state: DepItem['state']) => boolean;
    };
}
export interface DepsObserver {
    next: (params: {
        name: NamePath;
    }, onTrigger?: (params: DepsTriggerReturnData) => void) => void;
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
export default function createSubject(): DepsSubject;
export {};
