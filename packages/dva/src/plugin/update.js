import { prefixType } from '../util';

const UPDATE_STATE_ACTION = 'updateState';

function createEffects(sagaEffects, model) {
  const { put } = sagaEffects;
  function update(payload) {
    return put({ type: prefixType(UPDATE_STATE_ACTION, model), payload });
  }

  return { ...sagaEffects, update };
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
  reducer(reducers = {}) {
    return {
      ...reducers,
      [UPDATE_STATE_ACTION](state, { payload }) {
        return {
          ...state,
          ...payload,
        };
      },
    };
  },
};
