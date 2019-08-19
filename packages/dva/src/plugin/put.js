import { prefixType } from '../util';

function createEffects(sagaEffects, model) {
  function put(type, payload) {
    let action = type;
    if (typeof action === 'string') {
      action = {
        type: action,
        payload,
      };
    }
    return sagaEffects.put({ ...action, type: prefixType(action.type, model) });
  }

  function putResolve(type, payload) {
    let action = type;
    if (typeof action === 'string') {
      action = {
        type: action,
        payload,
      };
    }
    return sagaEffects.put.resolve({
      ...action,
      type: prefixType(type, model),
    });
  }
  put.resolve = putResolve;

  return { ...sagaEffects, put };
}

export default {
  onEffect(effect, sagaEffects, model) {
    return function* effectEnhancer(actionAction, effects) {
      const result = yield effect(
        action,
        createEffects(effects || sagaEffects, model)
      );
      return result;
    };
  },
};
