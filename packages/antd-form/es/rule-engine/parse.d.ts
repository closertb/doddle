import { AnyObject } from './interface';
export default function parse({ fieldName, changes, context, methods, }: {
    changes: any[];
    context: Record<string, any>;
    fieldName: string;
    methods: Record<string, any>;
}): (methods: any, ...args: any[]) => Promise<any[][]>;
export declare const systemMethods: {
    tel: (rule: any, value: any) => string;
    email: (rule: any, value: any) => string;
};
export declare function parseRules({ form, required, fieldName, rules, context, methods, requiredMessage, }: {
    form: AnyObject;
    required: boolean;
    requiredMessage?: string;
    rules: {
        caseItems?: any[];
    };
    context: Record<string, any>;
    fieldName: string;
    methods: Record<string, any>;
}): any[];
