import React, { useEffect } from 'react';
import { useFormContext } from '..';
import { Form } from 'antd';
import { hformItemSymbol, formatName } from '../utils/constant';
import { FormItemProps } from 'antd/es/form/FormItem';
import { ValidatorRule } from 'rc-field-form/lib/interface';

export interface HFormItemProps extends FormItemProps {
  fullName?: string;
  validatedOnMounted?: boolean;
}

export function FormItem(props: HFormItemProps) {
  const {
    name,
    fullName,
    rules,
    children,
    validatedOnMounted = false,
    ...others
  } = props;
  const { actions, _subjects, form, formStatus } = useFormContext();

  let _rules = rules;
  const formatedName = formatName((fullName || name) as string);

  const registerAction = actions?.[formatedName];
  // FormItem 自己没定义rules, 且用了交互组件，那这个规则就是下发下来的
  if (formStatus !== 'view' && !_rules && registerAction?.rules) {
    _rules = actions[formatedName].rules as ValidatorRule[];
  }

  useEffect(() => {
    if (formStatus === 'view' || !registerAction) return;
    const rg = _subjects.state.register({
      name: formatedName,
      fullName,
      rules: _rules as ValidatorRule[],
      mounted: true,
    });

    if (validatedOnMounted) {
      // console.log('tttt trigger on mounted', fullName || name);
      form.validateFields([fullName || name])
      // 这里吃掉 抛出去的 error
      .catch(() => {});
    }

    return () => {
      rg.updateState({
        mounted: false,
      })
    };
  }, []);


  return (
    <Form.Item
      name={name}
      rules={_rules}
      {...others}
    >
      {children}
    </Form.Item>
  );
}

FormItem.$type = hformItemSymbol;
