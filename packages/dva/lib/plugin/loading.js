'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports['default'] = void 0;

var _utils = require('../utils');

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly)
      symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    keys.push.apply(keys, symbols);
  }
  return keys;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    if (i % 2) {
      ownKeys(source, true).forEach(function(key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(source).forEach(function(key) {
        Object.defineProperty(
          target,
          key,
          Object.getOwnPropertyDescriptor(source, key)
        );
      });
    }
  }
  return target;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

var UPDATE_LOADING_ACTION = 'updateLoading';

var removePrefixType = function removePrefixType(effectName) {
  return effectName.split('/')[1];
};

var _default = {
  state: function state() {
    var initState =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return _objectSpread({}, initState, {
      loading: {},
    });
  },
  onEffect: function onEffect(effect, sagaEffects, model, actionType) {
    return (
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(actionAction) {
        var effects,
          put,
          effectName,
          result,
          _args = arguments;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch ((_context.prev = _context.next)) {
              case 0:
                effects =
                  _args.length > 1 && _args[1] !== undefined
                    ? _args[1]
                    : sagaEffects;
                put = effects.put;
                effectName = removePrefixType(actionType);
                _context.next = 5;
                return put({
                  type: (0, _utils.prefixType)(UPDATE_LOADING_ACTION, model),
                  payload: {
                    effectName: effectName,
                    value: true,
                  },
                });

              case 5:
                _context.next = 7;
                return effect(action, effects);

              case 7:
                result = _context.sent;
                _context.next = 10;
                return put({
                  type: (0, _utils.prefixType)(UPDATE_LOADING_ACTION, model),
                  payload: {
                    effectName: effectName,
                    value: false,
                  },
                });

              case 10:
                return _context.abrupt('return', result);

              case 11:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee);
      })
    );
  },
  reducer: function reducer(reducers) {
    return _objectSpread(
      {},
      reducers,
      _defineProperty({}, UPDATE_LOADING_ACTION, function(state, _ref) {
        var _ref$payload = _ref.payload,
          effectName = _ref$payload.effectName,
          value = _ref$payload.value;
        var loading = state.loading;
        return _objectSpread({}, state, {
          loading: _objectSpread(
            {},
            loading,
            _defineProperty({}, effectName, value)
          ),
        });
      })
    );
  },
};
exports['default'] = _default;
