import React from 'react';
import { FormListFieldData, FormListOperation, FormListProps } from 'antd/es/form/FormList';
import { ValidatorRule } from 'rc-field-form/lib/interface';
import { hformListSymbol } from '../utils/constant';
interface HFormListFieldData extends FormListFieldData {
    entrie: string;
    segments: string[];
}
interface HFormListOperationOptions {
    shouldValidate?: boolean;
}
interface HFormListOperation extends Pick<FormListOperation, 'remove' | 'move'> {
    prepend: (data: any) => void;
    insert: (index: number, data: any) => void;
    update: (index: number, data: any) => void;
    clear: () => void;
    add: (data: any, options: HFormListOperationOptions) => void;
}
interface HFormListProps extends Omit<FormListProps, 'children' | 'rules'> {
    deps?: string[] | string;
    rules?: ValidatorRule[];
    fullName?: string;
    children: (fields: HFormListFieldData[], operation: HFormListOperation, meta: {
        errors: React.ReactNode[];
        warnings: React.ReactNode[];
    }) => React.ReactNode;
}
export declare function FormList(props: HFormListProps): React.JSX.Element;
export declare namespace FormList {
    var $type: typeof hformListSymbol;
}
export {};
