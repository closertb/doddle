'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports['default'] = void 0;

var _util = require('../util');

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

var UPDATE_STATE_ACTION = 'updateState';

function createEffects(sagaEffects, model) {
  var put = sagaEffects.put;

  function update(payload) {
    return put({
      type: (0, _util.prefixType)(UPDATE_STATE_ACTION, model),
      payload: payload,
    });
  }

  return _objectSpread({}, sagaEffects, {
    update: update,
  });
}

var _default = {
  onEffect: function onEffect(effect, sagaEffects, model) {
    return (
      /*#__PURE__*/
      regeneratorRuntime.mark(function effectEnhancer(action, effects) {
        var result;
        return regeneratorRuntime.wrap(function effectEnhancer$(_context) {
          while (1) {
            switch ((_context.prev = _context.next)) {
              case 0:
                _context.next = 2;
                return effect(
                  action,
                  createEffects(effects || sagaEffects, model)
                );

              case 2:
                result = _context.sent;
                return _context.abrupt('return', result);

              case 4:
              case 'end':
                return _context.stop();
            }
          }
        }, effectEnhancer);
      })
    );
  },
  reducer: function reducer() {
    var reducers =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return _objectSpread(
      {},
      reducers,
      _defineProperty({}, UPDATE_STATE_ACTION, function(state, _ref) {
        var payload = _ref.payload;
        return _objectSpread({}, state, {}, payload);
      })
    );
  },
};
exports['default'] = _default;
