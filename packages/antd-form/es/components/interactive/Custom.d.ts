import React from 'react';
import { HFormCustomAction } from '../../types';
import { AnyObject } from '../../rule-engine/interface';
export interface TSchemaAction {
    change: any[];
    deps: string[];
    changeValidate?: boolean;
    required?: false;
    triggerDepsWithVisible?: boolean;
    requiredMessage?: string;
    rules?: {
        caseItems: any;
    };
}
export interface InteractiveCustomProps {
    action?: HFormCustomAction;
    /**
     * deps 触发变化的时候会触发 onChange
     * @param value
     * @param methods
     * @returns
     */
    visible?: boolean;
    hidden?: boolean;
    triggerOnMounted?: boolean;
    triggerDepsWithVisible?: boolean;
    vmode?: 'out' | 'in';
    children?: JSX.Element;
    unControlProps?: string[];
    schemaMode?: boolean;
    schemaEditMode?: boolean;
    importMethods?: AnyObject;
}
declare const Custom: React.FC<InteractiveCustomProps>;
export default Custom;
