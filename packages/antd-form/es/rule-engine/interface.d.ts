export type AnyObject = Record<string, any>;
export type TPriority = number;
export type TLogicType = 'all' | 'any';
export interface TEvent {
    type: string;
    result?: string | AnyObject;
    params?: AnyObject;
}
export interface TLoginCondition {
    conditionType: 'logic';
    priority?: number;
    fact: 'context' | 'field';
    operator: string;
    value: any;
    path: string;
}
export interface TMethodCondition {
    priority?: number;
    conditionType: 'method';
    withResult: boolean;
    methodName: string;
    method: (...args: any[]) => any;
}
export type TCondition = TLoginCondition | TMethodCondition;
export type TOperatorType = 'any' | 'all';
export declare enum TOperatorLogicEnum {
    ANY = "any",
    ALL = "all"
}
export interface TRuleOption {
    priority?: number;
    id?: string;
    name?: string | number;
    conditions: {
        [key in TOperatorLogicEnum]: TCondition[];
    };
    event: TEvent;
    onSuccess?: () => void;
    onFailure?: () => void;
}
export declare enum TFactType {
    CONSTANT = "CONSTANT",
    DYNAMIC = "DYNAMIC"
}
export type TOperator = (leftValue: any, rightValue: any) => boolean;
export type TValidator = (value?: any) => boolean;
export declare enum TStatus {
    READY = "READY",
    RUNNING = "RUNNING",
    FINISHED = "FINISHED"
}
export type TcallbackMethods = Record<string, (args: any) => void>;
