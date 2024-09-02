import { formatName } from './constant';
import { HFormActionFunc, ActionsGroup, HFormCustomAction } from '../types';

/**
 * 创建 actions
 * @param actions 这里需要直接修改 actions
 * @param props Custom 的 props
 * @param form form
 * @param propsRef ref
 * @returns
 */
export function createAction(actions: ActionsGroup, props: any, propsRef) {
  const { children, action: privateAction } = props;
  const { name, fullName } = children.props;
  const formatedName = formatName(fullName || name);

  if (privateAction && !actions?.[name]) {
    actions[formatedName] = privateAction;
  }

  let action = actions?.[formatedName];

  if (typeof action === 'function') {
    actions[formatedName] = (action as HFormActionFunc)(propsRef);

    action = actions[formatedName] as HFormCustomAction;
  }

  if (!action) {
    throw new Error(`Field <${formatedName}> action is required.`);
  }

  return action;
}
