'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports['default'] = void 0;

var _react = _interopRequireDefault(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var utils = _interopRequireWildcard(require('../utils'));

var _DemoItem = _interopRequireDefault(require('./DemoItem'));

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  } else {
    var newObj = {};
    if (obj != null) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          var desc =
            Object.defineProperty && Object.getOwnPropertyDescriptor
              ? Object.getOwnPropertyDescriptor(obj, key)
              : {};
          if (desc.get || desc.set) {
            Object.defineProperty(newObj, key, desc);
          } else {
            newObj[key] = obj[key];
          }
        }
      }
    }
    newObj['default'] = obj;
    return newObj;
  }
}

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

var DemoArticle =
  /*#__PURE__*/
  (function(_React$PureComponent) {
    _inherits(DemoArticle, _React$PureComponent);

    function DemoArticle(props) {
      var _this;

      _classCallCheck(this, DemoArticle);

      _this = _possibleConstructorReturn(
        this,
        _getPrototypeOf(DemoArticle).call(this, props)
      );
      _this.state = {
        isWide: true,
      };
      _this.getDemoComponent = _this.getDemoComponent.bind(
        _assertThisInitialized(_this)
      );
      return _this;
    }

    _createClass(DemoArticle, [
      {
        key: 'getDemoComponent',
        value: function getDemoComponent(pageData) {
          if (!pageData.demo) {
            return null;
          }

          var isWide = this.state.isWide;
          var toReactComponent = this.props.utils.toReactComponent;
          return Object.keys(pageData.demo)
            .map(function(key) {
              return pageData.demo[key];
            })
            .filter(function(item) {
              return !item.meta.hidden;
            })
            .sort(function(a, b) {
              return a.meta.order - b.meta.order;
            })
            .map(function(item, i) {
              var content = toReactComponent(['div'].concat(item.content));
              var shouldPreviewDemo = isWide && !item.meta.url;
              var demoProps = {
                key: i,
                title: item.meta.title,
                content: content,
                url: item.meta.url,
                mobile: item.meta.mobile,
                code: toReactComponent(item.highlightedCode),
                isWide: isWide,
              };
              return _react['default'].createElement(
                _DemoItem['default'],
                demoProps,
                shouldPreviewDemo
                  ? item.preview(_react['default'], _reactDom['default'])
                  : null
              );
            });
        }, // eslint-disable-next-line class-methods-use-this
      },
      {
        key: 'renderSample',
        value: function renderSample() {
          return _react['default'].createElement(
            'div',
            {
              className: 'page-content frame',
            },
            _react['default'].createElement(
              'div',
              {
                className: 'frame-header',
              },
              'what'
            )
          );
        },
      },
      {
        key: 'render',
        value: function render() {
          var _this$props = this.props,
            _this$props$pageData = _this$props.pageData,
            page = _this$props$pageData === void 0 ? {} : _this$props$pageData,
            toReactComponent = _this$props.utils.toReactComponent;
          var pageData = page.meta ? page : utils.getUniquePageData(page);
          var _pageData$meta = pageData.meta,
            meta = _pageData$meta === void 0 ? {} : _pageData$meta,
            content = pageData.content,
            changelog = pageData.changelog,
            api = pageData.api,
            toc = pageData.toc;
          var title = meta.title,
            tc = meta.toc;
          var demoComponent = this.getDemoComponent(pageData);
          var disableToc = tc === false;
          return _react['default'].createElement(
            'div',
            null,
            _react['default'].createElement('h1', null, title),
            _react['default'].createElement(
              'div',
              {
                className: 'page-content markdown',
              },
              toReactComponent(content)
            ),
            demoComponent &&
              _react['default'].createElement(
                'div',
                {
                  className: 'demo-wrapper',
                },
                demoComponent
              ),
            api &&
              _react['default'].createElement(
                'div',
                {
                  className: 'page-api markdown',
                },
                toReactComponent(api),
                changelog &&
                  _react['default'].createElement(
                    'div',
                    {
                      className: 'page-content markdown',
                    },
                    toReactComponent(changelog)
                  )
              ),
            !toc || toc.length <= 1 || disableToc
              ? null
              : _react['default'].createElement(
                  'section',
                  {
                    className: 'toc',
                  },
                  toReactComponent(toc)
                )
          );
        },
      },
    ]);

    return DemoArticle;
  })(_react['default'].PureComponent);

exports['default'] = DemoArticle;
