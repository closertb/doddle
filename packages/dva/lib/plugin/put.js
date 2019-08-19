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

function createEffects(sagaEffects, model) {
  function put(type, payload) {
    var action = type;

    if (typeof action === 'string') {
      action = {
        type: action,
        payload: payload,
      };
    }

    return sagaEffects.put(
      _objectSpread({}, action, {
        type: (0, _utils.prefixType)(action.type, model),
      })
    );
  }

  function putResolve(type, payload) {
    var action = type;

    if (typeof action === 'string') {
      action = {
        type: action,
        payload: payload,
      };
    }

    return sagaEffects.put.resolve(
      _objectSpread({}, action, {
        type: (0, _utils.prefixType)(type, model),
      })
    );
  }

  put.resolve = putResolve;
  return _objectSpread({}, sagaEffects, {
    put: put,
  });
}

var _default = {
  onEffect: function onEffect(effect, sagaEffects, model) {
    return (
      /*#__PURE__*/
      regeneratorRuntime.mark(function effectEnhancer(actionAction, effects) {
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
};
exports['default'] = _default;
