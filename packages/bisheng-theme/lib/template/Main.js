'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports['default'] = void 0;

var _react = _interopRequireDefault(require('react'));

var _reactDocumentTitle = _interopRequireDefault(
  require('react-document-title')
);

var _Layout = _interopRequireDefault(require('./Layout'));

var _DemoArticle = _interopRequireDefault(require('./Content/DemoArticle'));

var _utils = require('./utils');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _extends() {
  _extends =
    Object.assign ||
    function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
  return _extends.apply(this, arguments);
}

var Main = function Main(props) {
  var data = props.data; // 数据格式化

  (0, _utils.normalizeData)(data);
  var config = props.themeConfig,
    pathname = props.location.pathname;
  var rootPath = process.env.NODE_ENV === 'development' ? '' : config.root; // default root path is '/', so the default length is 1, so set the offset to 2

  if (pathname.length < rootPath.length + 2) {
    window.location.href = rootPath + config.home;
    return _react['default'].createElement('div', null, 'redirect to home');
  }

  return _react['default'].createElement(
    _reactDocumentTitle['default'],
    {
      title: config.title || 'siteName',
    },
    _react['default'].createElement(
      _Layout['default'],
      _extends({}, props, {
        data: data,
        selectedKey: pathname,
      }),
      _react['default'].createElement(_DemoArticle['default'], props)
    )
  );
};

var _default = _react['default'].memo(Main);

exports['default'] = _default;
