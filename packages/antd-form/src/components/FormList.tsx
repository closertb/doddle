import React from 'react';
import { Form } from 'antd';
import { FormListFieldData, FormListOperation, FormListProps } from 'antd/es/form/FormList';
import { ValidatorRule } from 'rc-field-form/lib/interface';
import { useFormContext } from '..';
import { hformListSymbol, formatName } from '../utils/constant';

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

export function FormList(props: HFormListProps) {
  const { name: formName, fullName, rules } = props;
  const { form, watch, actions, _subjects } = useFormContext();
  let _rules = rules;

  const formatedName = formatName(fullName || formName);
  // FormItem 自己没定义rules, 且用了交互组件，那这个规则就是下发下来的
  // TODO: 这里似乎没有覆盖到 actionFunction 场景
  if (!_rules && (actions?.[formatedName])?.rules) {
    _rules = actions?.[formatedName].rules as ValidatorRule[];
  }

  _subjects.state.register({ name: formatedName, fullName, rules: _rules });

  return (
    <Form.List
      name={formName}
      rules={_rules}
    >
      {(fields, operation, meta) => {
        const { add, ...restOperation } = operation;

        const originAdd = add;

        const methods: HFormListOperation = {
          ...restOperation,
          prepend: (data) => {},
          insert: (index, data) => {},
          update: (index, data) => {},
          clear: () => {},
          // defaultValue?: StoreValue, insertIndex?: number
          add: (data, options?) => {
            originAdd(data);
          },
        };

        const renderListChild = props.children(
          fields as HFormListFieldData[],
          methods,
          meta,
        );

        return renderListChild;
      }}
    </Form.List>
  );
}

FormList.$type = hformListSymbol;
