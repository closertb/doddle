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

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var NotFound = function NotFound(props) {
  return _react['default'].createElement(
    _reactDocumentTitle['default'],
    {
      title: 'Not Found | '.concat(props.themeConfig.title),
    },
    _react['default'].createElement(
      _Layout['default'],
      props,
      _react['default'].createElement(
        'h1',
        {
          className: 'entry-title',
        },
        '404 Not Found!'
      )
    )
  );
};

var _default = _react['default'].memo(NotFound);

exports['default'] = _default;
