'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports['default'] = void 0;

var _react = _interopRequireDefault(require('react'));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function Footer(props) {
  var _props$friendLink = props.friendLink,
    friendLink = _props$friendLink === void 0 ? [] : _props$friendLink;
  return _react['default'].createElement(
    'div',
    {
      className: 'footer',
    },
    _react['default'].createElement(
      'ul',
      {
        className: 'friend-link',
      },
      friendLink.map(function(_ref) {
        var name = _ref.name,
          link = _ref.link;
        return _react['default'].createElement(
          'li',
          {
            key: name,
          },
          _react['default'].createElement(
            'a',
            {
              href: link,
              target: '_blank',
              rel: 'noopener noreferrer',
            },
            name
          )
        );
      })
    ),
    _react['default'].createElement(
      'p',
      {
        className: 'copyright',
      },
      'powered by',
      _react['default'].createElement(
        'a',
        {
          style: {
            paddingLeft: 10,
          },
          href: 'http://closertb.site',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
        'MrDenzel'
      )
    )
  );
}

var _default = _react['default'].memo(Footer);

exports['default'] = _default;
