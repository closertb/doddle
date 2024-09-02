import type { FormInstance } from 'antd/es/form/hooks/useForm';

export interface HFormInstance extends FormInstance {
  // TODO: tangbo
  globalContext?: Map<string, any>;
}