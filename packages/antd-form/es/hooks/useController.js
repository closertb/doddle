import { Form } from 'antd';
import { useEffect } from 'react';
import { useForm } from '..';
export default function useController(props) {
    const [form] = Form.useForm();
    // todo
    const methods = useForm({
        form,
    });
    // form.currentName = props.name || 'lastform';
    useEffect(() => {
        (props === null || props === void 0 ? void 0 : props.init) && (props === null || props === void 0 ? void 0 : props.init(methods.form));
    }, []);
    // console.log('actions:', actionsRef.current);
    return {
        form,
        methods,
    };
}
