import { Type } from '../utils';

function createEffects(sagaEffects, model) {
  function select(selector = store => store) {
    if (Type.isString(selector)) {
      const namespace = selector;
      selector = store => store[namespace];
    } else if (Type.isArray(selector)) {
      selector = store => selector.map(key => store[key]);
    }
    return sagaEffects.select(selector);
  }

  return { ...sagaEffects, select };
}

export default {
  onEffect(effect, sagaEffects, model) {
    return function* effectEnhancer(action, effects) {
      const result = yield effect(
        action,
        createEffects(effects || sagaEffects, model)
      );
      return result;
    };
  },
};
