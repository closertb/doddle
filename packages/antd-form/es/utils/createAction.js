import { formatName } from './constant';
/**
 * 创建 actions
 * @param actions 这里需要直接修改 actions
 * @param props Custom 的 props
 * @param form form
 * @param propsRef ref
 * @returns
 */
export function createAction(actions, props, propsRef) {
    const { children, action: privateAction } = props;
    const { name, fullName } = children.props;
    const formatedName = formatName(fullName || name);
    if (privateAction && !(actions === null || actions === void 0 ? void 0 : actions[name])) {
        actions[formatedName] = privateAction;
    }
    let action = actions === null || actions === void 0 ? void 0 : actions[formatedName];
    if (typeof action === 'function') {
        actions[formatedName] = action(propsRef);
        action = actions[formatedName];
    }
    if (!action) {
        throw new Error(`Field <${formatedName}> action is required.`);
    }
    return action;
}
