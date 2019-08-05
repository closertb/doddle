'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports['default'] = void 0;

var _react = _interopRequireDefault(require('react'));

var _Header = _interopRequireDefault(require('./Header'));

var _Footer = _interopRequireDefault(require('./Footer'));

var _SideBar = _interopRequireDefault(require('./SideBar'));

require('../../static/style');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var Layout = function Layout(_ref) {
  var data = _ref.data,
    themeConfig = _ref.themeConfig,
    children = _ref.children,
    selectedKey = _ref.selectedKey;
  var siteKey = themeConfig.siteKey,
    github = themeConfig.github,
    friendLinks = themeConfig.friendLinks;
  return _react['default'].createElement(
    'div',
    null,
    _react['default'].createElement(_Header['default'], {
      name: siteKey,
    }),
    _react['default'].createElement(
      'div',
      {
        style: {
          float: 'left',
          width: '230px',
          height: '100%',
        },
      },
      _react['default'].createElement(_SideBar['default'], {
        themeConfig: themeConfig,
        data: data,
        selectedKey: selectedKey,
      })
    ),
    _react['default'].createElement(
      'div',
      {
        style: {
          padding: '20px 30px 0 50px',
          overflow: 'hidden',
        },
        className: 'document yue',
      },
      children,
      _react['default'].createElement(_Footer['default'], {
        friendLink: friendLinks,
        github: github,
      })
    )
  );
};

var _default = _react['default'].memo(Layout);

exports['default'] = _default;
