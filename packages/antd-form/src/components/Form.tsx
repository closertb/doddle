import React from 'react';
import { Form } from 'antd';
import { FormProps } from 'antd/es/form/Form';
import { useFormContext } from '../hooks/useFormContext';
import { debounce } from 'lodash-es';
// import { debounce } from 'lodash-es';

export function HForm(props: FormProps) {
  const { name, onValuesChange, onFinishFailed, onFieldsChange, onFinish, ...others } = props;
  const { form, formState, trigger } = useFormContext();

  const proxyFormMethods: {
    onFieldsChange: (changedFields: any[], allFields: any) => void;
    onFinishFailed?: (errorInfo: {
      values: any;
      errorFields: any[];
      outOfDate: boolean
    }) => void;
    onFinish?: (values: any) => void;
  } = {
    onFieldsChange: (changedFields, allFields) => {
      const { validating } = formState.current;
      onFieldsChange && onFieldsChange(changedFields, allFields);
      if (validating) {
        console.log('wwww on validating');
        return;
      }
      changedFields?.forEach((changedField) => {
        trigger(changedField, true);
      });
    },
  };

  if (typeof onFinishFailed === 'function') {
    proxyFormMethods.onFinishFailed = (errorInfo) => {
      debounce(() => {
        console.log('wwww clear validating onFinishFailed');
        formState.current.validating = false;
      }, 200)();
      onFinishFailed(errorInfo);
    }
  }

  if (typeof onFinish === 'function') {
    proxyFormMethods.onFinish = (errorInfo) => {
      debounce(() => {
        console.log('wwww clear validating onFinish');
        formState.current.validating = false;
      }, 200)();
      onFinish(errorInfo);
    }
  }
  
  // @ts-ignore
  return (<Form {...others} {...proxyFormMethods} form={form} onValuesChange={onValuesChange} name={name} />);
}

HForm.useForm = Form.useForm;

HForm.useWatch = Form.useWatch;
