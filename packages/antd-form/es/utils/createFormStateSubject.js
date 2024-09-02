import { formatName } from '.';
export default function createFormStateSubject(form) {
    const _observers = new Map();
    const trigger = (values, changeField) => {
        var _a;
        const { name, entire, segments, matched } = values;
        const id = formatName(name);
        // 要被触发的 field name
        if (_observers.has(id)) {
            const observer = _observers.get(id);
            // !observer?.mounted && console.log('ttttt mounted status: unmounted');
            if ((observer === null || observer === void 0 ? void 0 : observer.mounted) && (observer === null || observer === void 0 ? void 0 : observer.rules) && ((_a = observer === null || observer === void 0 ? void 0 : observer.rules) === null || _a === void 0 ? void 0 : _a.length)) {
                // generateValidator(observer?.rules, {
                //   dep: {
                //     entire,
                //     segments,
                //     by: matched,
                //   },
                //   form,
                //   getValue: (n: NamePath) => form.getFieldValue(n),
                // });
                // console.log('ttttt validated trigger', name);
                // @ts-ignore
                form.validateFields([name], 'fromWaform')
                    // 这里吃掉 抛出去的 error
                    .catch(() => { }); // TODO 这里catch 掉的意义什么？
            }
        }
    };
    /**
     * 校验到第一个就停止
     */
    const first = () => { };
    const register = (observer) => {
        const { name, fullName, rules, mounted = true } = observer;
        const id = formatName(name);
        if (!_observers.has(id)) {
            const data = {
                id,
                rules,
                // 原始传入的 name
                name,
                // name 的filed 完整路径
                fullName,
                // 是否已挂载
                mounted,
                _modify_rules_count: 0,
            };
            _observers.set(id, data);
        }
        else {
            const currentState = _observers.get(id);
            const nextState = Object.assign(Object.assign({}, currentState), { mounted: true });
            // 更新 rules
            // if (!isEqual(currentState.rules, rules)) {
            //   nextState._modify_rules_count = 1 + currentState._modify_rules_count;
            //   nextState.rules = rules;
            // }
            _observers.set(id, nextState);
        }
        return {
            unregister: () => { },
            updateState: (props = {}) => {
                const _curState = _observers.get(id);
                _observers.set(id, Object.assign(Object.assign({}, _curState), props));
            }
        };
    };
    const unregister = () => {
        _observers.clear();
    };
    return {
        get observers() {
            return _observers;
        },
        trigger,
        first,
        register,
        unregister,
    };
}
