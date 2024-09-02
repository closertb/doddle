import type { FormInstance } from 'antd/es/form/hooks/useForm';
export interface HFormInstance extends FormInstance {
    globalContext?: Map<string, any>;
}
