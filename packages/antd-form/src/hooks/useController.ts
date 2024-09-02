import { Form } from 'antd';
import { useEffect } from 'react';
import { useForm } from '..';

export default function useController(props?: any) {
  const [form] = Form.useForm();
  // todo
  const methods = useForm({
    form,
  });

  // form.currentName = props.name || 'lastform';
  useEffect(() => {
    props?.init && props?.init(methods.form);
  }, []);

  // console.log('actions:', actionsRef.current);

  return {
    form,
    methods,
  };
}
