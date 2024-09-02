var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { eachPath, formatName } from '.';
import { matchPath } from './path';
export default function createSubject() {
    /**
     * 数据项（Field）发生变化的时候，需要查找谁在依赖自己的 Change
     * 例如：
     *  逻辑：chengzi 依赖于 deo 下 price 字段 （deo.*.price） 的变化
     *  即：（deo.*.price）触发 chengzi 的交互逻辑
     *  <Custom
     *    deps=['deo.*.price']
     *  >
     *    <FormItem name="chengzi" />
     *  </Custom>
     *
     *  <FormList
     *     name="deo"
     *  >
     *    for {
     *      <FormItem name={[field.name, 'price']} />
     *    }
     *  </FormList>
     *  1. Dep Field Path:
     *    数组项：name={[field.name, 'age']} 发生变化-> *(deo.*.age)
     *  2. Dep Field Path: ['wanwu'] -> wanwu
     *
     * 储存逻辑：
     *  Map<
     *    string(
     *      deo.*.age // dep
     *    ),
     *    Array<
     *      chengzi, // filedName
     *      ...,
     *    >
     *  >
     *
     * 卸载逻辑
     *  1. 如果 chengzi 被卸载，那么需要通知 deo.*.price 取消对 chengzi 的监听
     */
    const _deps = new Map();
    /**
     * 这里存储 filed 在依赖变更下的 onChange 回调
     * 例如：chengzi -> fn.onChange
     *  <Custom
     *    deps=['deo.*.price']
     *    onChange={() => { ... }}
     *  >
     *    <FormItem name="chengzi" />
     *  </Custom>
     */
    const _fields = new Map();
    /**
     * 这里的 name 是 filed 实际触发的位置，外部需要转换为 deo.0.price 此类格式
     * @param param name changedFiledName
     */
    const next = ({ name }, onTrigger) => {
        const id = formatName(name);
        /**
         * 这里的 fields 是 _deps 的 value 里面存储的依赖 dep 的字段集合
         *
         * 注意：这里 _deps 和 _fields 之间的 是通过 formatName 后的 id 来进行对应关系的查找
         */
        _deps.forEach((fields, dep) => {
            const paths = matchPath(dep, id);
            if (paths !== null) {
                fields.forEach((field) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b, _c, _d, _e;
                    // dep 的动作触发 field 的 onChange 的交互逻辑
                    // 这里是其实是要被触发的 field name
                    if (_fields.has(field.id)) {
                        const triggers = _fields.get(field.id);
                        const ret = {
                            // 匹配到依赖触发的位置
                            matched: dep,
                            // a.*.b
                            entire: paths.entire,
                            // [a, *, b]
                            segments: paths.segments,
                            // 需要被触发的 field
                            name: field.name,
                        };
                        // console.log('tttttt', field.id, triggers);
                        // 先触发绑定的 onChange 回调， 后触发校验
                        (_a = triggers === null || triggers === void 0 ? void 0 : triggers.callback) === null || _a === void 0 ? void 0 : _a.call(triggers, ret);
                        // 由于被触发的节点还在挂载中，所以这时需要延迟触发
                        // setTimeout(() => {
                        if (triggers === null || triggers === void 0 ? void 0 : triggers.hooks) {
                            const beforeRulesValue = (_c = (_b = triggers === null || triggers === void 0 ? void 0 : triggers.hooks) === null || _b === void 0 ? void 0 : _b.beforeRules) === null || _c === void 0 ? void 0 : _c.call(_b, ret, field.state);
                            if (beforeRulesValue === false) {
                                return;
                            }
                        }
                        // 默认逻辑，如果 fields 被隐藏了则不需要进行触发校验
                        if (((_d = triggers === null || triggers === void 0 ? void 0 : triggers.hooks) === null || _d === void 0 ? void 0 : _d.beforeRules) == null && !((_e = field.state) === null || _e === void 0 ? void 0 : _e.visible))
                            return;
                        /**
                         * 触发给到 deps next 的回调
                         * _subjects.deps.next({ name: changedField.name }, (ret) => {
                         *  _subjects.state.trigger(ret, changedField);
                         * });
                         */
                        onTrigger === null || onTrigger === void 0 ? void 0 : onTrigger(ret);
                        // }, 0);
                    }
                }));
            }
        });
        // console.log('tttttt _deps', _deps.size);
    };
    const subscribe = (observer) => {
        // state: 为监听的一些内部状态
        const { path, name, callback, state, hooks } = observer;
        /**
         * 这里将 name: NamePath 转换后当成 key 来存储
         */
        const id = formatName(name);
        eachPath(path, p => {
            var _a, _b;
            if (!_deps.has(p)) {
                _deps.set(p, []);
            }
            const index = (_a = _deps.get(p)) === null || _a === void 0 ? void 0 : _a.findIndex(n => n.id === id);
            if (index === -1) {
                (_b = _deps.get(p)) === null || _b === void 0 ? void 0 : _b.push({
                    id,
                    name,
                    state,
                });
            }
        });
        if (!_fields.has(id)) {
            _fields.set(id, {
                callback,
                hooks,
            });
        }
        return {
            unsubscribe: () => {
                // 在各个依赖项清空自己
                eachPath(observer.path, (p) => {
                    var _a;
                    if (_deps.has(p)) {
                        const nextValue = ((_a = _deps.get(p)) === null || _a === void 0 ? void 0 : _a.filter(n => n.id !== id)) || [];
                        _deps.set(p, nextValue);
                        _fields.delete(id);
                    }
                });
            },
        };
    };
    /**
     * 清空整个表单的所有监听
     */
    const unsubscribe = () => {
        _deps.clear();
        _fields.clear();
    };
    return {
        get observers() {
            return _deps;
        },
        next,
        subscribe,
        unsubscribe,
    };
}
