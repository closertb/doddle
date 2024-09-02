export default function useController(props?: any): {
    form: import("antd").FormInstance<any>;
    methods: import("./useForm").UseFormReturn;
};
