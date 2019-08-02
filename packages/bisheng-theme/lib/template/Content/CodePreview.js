'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports['default'] = void 0;

var _react = _interopRequireDefault(require('react'));

var _antd = require('antd');

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

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf
    ? Object.getPrototypeOf
    : function _getPrototypeOf(o) {
        return o.__proto__ || Object.getPrototypeOf(o);
      };
  return _getPrototypeOf(o);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError(
      "this hasn't been initialised - super() hasn't been called"
    );
  }
  return self;
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

var noop = function noop() {};

var CodePreview =
  /*#__PURE__*/
  (function(_React$PureComponent) {
    _inherits(CodePreview, _React$PureComponent);

    function CodePreview(props) {
      var _this;

      _classCallCheck(this, CodePreview);

      _this = _possibleConstructorReturn(
        this,
        _getPrototypeOf(CodePreview).call(this, props)
      );
      _this.state = {
        codeExpand: true,
      };
      _this.codeCon = _react['default'].createRef();
      _this.handleCodeExpand = _this.handleCodeExpand.bind(
        _assertThisInitialized(_this)
      );
      _this.fullscreenPreview = _this.fullscreenPreview.bind(
        _assertThisInitialized(_this)
      );
      return _this;
    }

    _createClass(CodePreview, [
      {
        key: 'fullscreenPreview',
        value: function fullscreenPreview() {
          var _this$props = this.props,
            title = _this$props.title,
            children = _this$props.children;

          _antd.Modal.info({
            title: title,
            content: children,
            iconType: 'code-o',
            width: '90%',
            okText: '关闭',
            onOk: noop,
            onCancel: noop,
            maskClosable: true,
          });
        },
      },
      {
        key: 'handleCodeExpand',
        value: function handleCodeExpand() {
          var codeExpand = this.state.codeExpand;
          this.setState({
            codeExpand: !codeExpand,
          });
        },
      },
      {
        key: 'render',
        value: function render() {
          var children = this.props.children;
          var codeExpand = this.state.codeExpand;
          var codePreviewClass = codeExpand
            ? 'code-preview'
            : 'code-preview-expand';
          return _react['default'].createElement(
            'div',
            {
              className: 'demo-code-preview',
            },
            _react['default'].createElement(
              'div',
              {
                className: 'ctrl',
              },
              _react['default'].createElement(
                _antd.Tooltip,
                {
                  placement: 'left',
                  title: '\u5168\u5C4F\u67E5\u770B',
                },
                _react['default'].createElement(
                  'span',
                  {
                    onClick: this.fullscreenPreview,
                  },
                  _react['default'].createElement(_antd.Icon, {
                    type: 'arrows-alt',
                  })
                )
              ),
              _react['default'].createElement(
                _antd.Tooltip,
                {
                  placement: 'right',
                  title: '\u67E5\u770B\u4EE3\u7801',
                },
                _react['default'].createElement(
                  'span',
                  {
                    onClick: this.handleCodeExpand,
                  },
                  _react['default'].createElement(_antd.Icon, {
                    type: 'down-square',
                  })
                )
              )
            ),
            _react['default'].createElement(
              'div',
              {
                className: codePreviewClass,
                ref: this.codeCon,
              },
              children
            )
          );
        },
      },
    ]);

    return CodePreview;
  })(_react['default'].PureComponent);

exports['default'] = CodePreview;
