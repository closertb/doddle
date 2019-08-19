import { prefixType } from '../util';

const UPDATE_LOADING_ACTION = 'updateLoading';
const removePrefixType = effectName => {
  return effectName.split('/')[1];
};

export default {
  state(initState = {}) {
    return {
      ...initState,
      loading: {},
    };
  },
  onEffect(effect, sagaEffects, model, actionType) {
    return function*(actionAction, effects = sagaEffects) {
      const { put } = effects;
      const effectName = removePrefixType(actionType);
      yield put({
        type: prefixType(UPDATE_LOADING_ACTION, model),
        payload: { effectName, value: true },
      });
      const result = yield effect(action, effects);
      yield put({
        type: prefixType(UPDATE_LOADING_ACTION, model),
        payload: { effectName, value: false },
      });
      return result;
    };
  },
  reducer(reducers) {
    return {
      ...reducers,
      [UPDATE_LOADING_ACTION](
        state,
        {
          payload: { effectName, value },
        }
      ) {
        const { loading } = state;
        return {
          ...state,
          loading: {
            ...loading,
            [effectName]: value,
          },
        };
      },
    };
  },
};
