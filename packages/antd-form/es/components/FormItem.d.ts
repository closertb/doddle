import React from 'react';
import { hformItemSymbol } from '../utils/constant';
import { FormItemProps } from 'antd/es/form/FormItem';
export interface HFormItemProps extends FormItemProps {
    fullName?: string;
    validatedOnMounted?: boolean;
}
export declare function FormItem(props: HFormItemProps): React.JSX.Element;
export declare namespace FormItem {
    var $type: typeof hformItemSymbol;
}
