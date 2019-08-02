'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports['default'] = void 0;

var _react = _interopRequireDefault(require('react'));

var _CodePreview = _interopRequireDefault(require('./CodePreview'));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _typeof(obj) {
  if (typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol') {
    _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj &&
        typeof Symbol === 'function' &&
        obj.constructor === Symbol &&
        obj !== Symbol.prototype
        ? 'symbol'
        : typeof obj;
    };
  }
  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ('value' in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === 'object' || typeof call === 'function')) {
    return call;
  }
  return _assertThisInitialized(self);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called"
    );
  }
  return self;
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf
    ? Object.getPrototypeOf
    : function _getPrototypeOf(o) {
        return o.__proto__ || Object.getPrototypeOf(o);
      };
  return _getPrototypeOf(o);
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError('Super expression must either be null or a function');
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: { value: subClass, writable: true, configurable: true },
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf =
    Object.setPrototypeOf ||
    function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };
  return _setPrototypeOf(o, p);
}

// import * as utils from '../utils';
var DEFAULT_HEIGHT = '550px';
var mobileStyle = {
  width: '375px',
  height: '550px',
};

var DemoItem =
  /*#__PURE__*/
  (function(_React$PureComponent) {
    _inherits(DemoItem, _React$PureComponent);

    function DemoItem(props) {
      var _this;

      _classCallCheck(this, DemoItem);

      _this = _possibleConstructorReturn(
        this,
        _getPrototypeOf(DemoItem).call(this, props)
      );
      _this.state = {
        intoViewport: true,
      };
      return _this;
    }

    _createClass(DemoItem, [
      {
        key: 'getIframe',
        value: function getIframe() {
          var _this$props = this.props,
            url = _this$props.url,
            mobile = _this$props.mobile,
            height = _this$props.height;
          var width = '100%';
          var finHeight = height;

          if (mobile) {
            width = mobileStyle.width;
            finHeight = height || mobileStyle.height;
          }

          finHeight = finHeight || DEFAULT_HEIGHT;
          return _react['default'].createElement(
            'div',
            {
              className: 'demo-preview-frame',
            },
            _react['default'].createElement('iframe', {
              title: 'base',
              srr: url,
              width: width,
              height: finHeight,
              frameBorder: '0',
            })
          );
        },
      },
      {
        key: 'render',
        value: function render() {
          var _this$props2 = this.props,
            children = _this$props2.children,
            title = _this$props2.title,
            content = _this$props2.content,
            code = _this$props2.code,
            isWide = _this$props2.isWide;
          var intoViewport = this.state.intoViewport;
          return _react['default'].createElement(
            'div',
            {
              className: 'demo-item',
            },
            _react['default'].createElement(
              'h3',
              {
                className: 'demo-title',
              },
              title
            ),
            _react['default'].createElement(
              'div',
              {
                className: 'demo-desc',
              },
              content
            ),
            _react['default'].createElement(
              'div',
              {
                className: 'demo-preview',
              },
              isWide && intoViewport ? children : null
            ),
            _react['default'].createElement(
              'div',
              {
                className: 'demo-code',
              },
              _react['default'].createElement(
                _CodePreview['default'],
                {
                  title: title,
                },
                code
              )
            )
          );
        },
      },
    ]);

    return DemoItem;
  })(_react['default'].PureComponent);

exports['default'] = DemoItem;
