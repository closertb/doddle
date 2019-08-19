'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports['default'] = _default;
Object.defineProperty(exports, 'plugin', {
  enumerable: true,
  get: function get() {
    return _plugin['default'];
  },
});

var _plugin = _interopRequireDefault(require('./plugin'));

var _util = require('./util');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var defaultPlugins = [
  _plugin['default'].put,
  _plugin['default'].select,
  _plugin['default'].update,
  _plugin['default'].listen,
  _plugin['default'].loading,
];
var dvaHooks = [
  'onError',
  'onStateChange',
  'onAction',
  'onHmr',
  'onReducer',
  'onEffect',
  'extraReducers',
  'extraEnhancers',
  '_handleActions',
];

var singularize = function singularize(key) {
  return key.endsWith('s') ? key.slice(0, -1) : key;
};

var noop = function noop(value) {
  return value;
};

var norNoop = function norNoop(fn) {
  return fn || noop;
};

function _default(_ref) {
  var app = _ref.app,
    customPlugins = _ref.plugins;
  var plugins = defaultPlugins;

  if (customPlugins) {
    plugins = customPlugins;
  }

  var _use = app.use;
  var _model = app.model;

  app.use = function(plugin) {
    if (!plugins.includes(plugin)) {
      plugins.push(plugin);
    } // 过滤掉dvahooks之外的属性，以避免app.use时报错

    _use(
      (0, _util.reduceToObject)(dvaHooks, function(key) {
        return plugin[key];
      })
    );
  };

  app.model = function(model) {
    _model(
      (0, _util.reduceToObject)(model, function(origin, key) {
        return plugins.reduce(function(prev, plugin) {
          return norNoop(plugin[singularize(key)])(prev);
        }, origin);
      })
    );
  };

  plugins.forEach(app.use);
  return app;
}
