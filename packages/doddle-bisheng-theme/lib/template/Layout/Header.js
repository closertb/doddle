'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports['default'] = void 0;

var _react = _interopRequireDefault(require('react'));

var _router = require('bisheng/router');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function Header(props) {
  var name = props.name;
  return _react['default'].createElement(
    'ul',
    {
      className: 'header',
    },
    _react['default'].createElement(
      'li',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
        },
      },
      _react['default'].createElement(
        _router.Link,
        null,
        _react['default'].createElement('img', {
          style: {
            width: 50,
          },
          alt: 'logo',
          src:
            'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
        })
      ),
      _react['default'].createElement(
        'span',
        {
          style: {
            paddingLeft: '20px',
            fontSize: '24px',
          },
        },
        name
      )
    )
  );
}

var _default = _react['default'].memo(Header);

exports['default'] = _default;
