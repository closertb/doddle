'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports['default'] = void 0;

var _react = _interopRequireDefault(require('react'));

var _router = require('bisheng/router');

var _antd = require('antd');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

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

var SubMenu = _antd.Menu.SubMenu;
var MenuItem = _antd.Menu.Item;
var MenuItemGroup = _antd.Menu.ItemGroup;
var DEFUALT_SORTER_TYPE = 'specify';

function characterSorter(a, b) {
  return a.key > b.key;
}

function numberSorter(a, b) {
  return a.meta.order - b.meta.order;
}

var OrderSorter = {
  native: characterSorter,
  specify: numberSorter,
};

function getComponentsMenuLink(meta, key) {
  var link = '/'.concat(key);
  return _react['default'].createElement(
    _router.Link,
    {
      to: link,
    },
    meta.title
  );
}

function getComponentsMenuItem(menus) {
  var sortType =
    arguments.length > 1 && arguments[1] !== undefined
      ? arguments[1]
      : DEFUALT_SORTER_TYPE;
  var sorter = OrderSorter[sortType];
  return menus.sort(sorter).map(function(item) {
    return _react['default'].createElement(
      MenuItem,
      {
        key: item.key,
      },
      getComponentsMenuLink(item.meta, item.key)
    );
  });
}

function getComponentsMenuGroups(data, componentOrder, sortType) {
  var menuGroups = componentOrder.map(function(category) {
    return {
      category: category,
      menus: [],
    };
  });
  Object.keys(data).forEach(function(key) {
    var curCategory = data[key].meta.category;
    var idx = componentOrder.indexOf(curCategory);

    if (idx !== -1) {
      var menuData = data[key];
      menuData.key = menuData.meta.filename.slice(
        0,
        menuData.meta.filename.lastIndexOf('/')
      );
      menuGroups[idx].menus.push(menuData);
    }
  });
  return menuGroups.map(function(item) {
    var category = item.category;
    return _react['default'].createElement(
      MenuItemGroup,
      {
        key: category,
        title: category,
      },
      getComponentsMenuItem(category, sortType)
    );
  });
}

function getComponentsMenuList(data, sortType) {
  var menus = Object.keys(data).map(function(key) {
    return _objectSpread(
      {
        key: data[key].meta.filename.slice(
          0,
          data[key].meta.filename.lastIndexOf('/')
        ),
      },
      data[key]
    );
  });
  return getComponentsMenuItem(menus, sortType);
}

function getArticlesMenu(data) {
  var menuList = Object.keys(data).map(function(key) {
    return _objectSpread(
      {
        key: data[key].meta.filename.slice(
          0,
          data[key].meta.filename.indexOf('.md')
        ),
      },
      data[key]
    );
  });
  return menuList
    .sort(function(a, b) {
      return a.meta.order - b.meta.order;
    })
    .map(function(item) {
      return _react['default'].createElement(
        MenuItem,
        {
          key: item.key,
        },
        _react['default'].createElement(
          _router.Link,
          {
            to: '/'.concat(item.key),
          },
          item.meta.title
        )
      );
    });
}

function ComponentsMenu(props) {
  var _props$mode = props.mode,
    mode = _props$mode === void 0 ? 'inline' : _props$mode,
    _props$data = props.data,
    data = _props$data === void 0 ? {} : _props$data,
    selectedKey = props.selectedKey,
    _props$defaultOpenKey = props.defaultOpenKeys,
    defaultOpenKeys =
      _props$defaultOpenKey === void 0 ? ['component'] : _props$defaultOpenKey,
    themeConfig = props.themeConfig;
  var compCategoryOrder = themeConfig.compCategoryOrder,
    compSorterType = themeConfig.compSorterType;
  var componentDatas = data.packages || data.components || data.src;
  var docs = data.docs || data.guide;
  return (
    // eslint-disable-next-line max-len
    _react['default'].createElement(
      _antd.Menu,
      {
        mode: mode,
        inlineIndent: 40,
        className: 'aside-container menu-site',
        selectedKeys: [selectedKey],
        defaultOpenKeys: defaultOpenKeys,
      },
      getArticlesMenu(docs),
      _react['default'].createElement(
        SubMenu,
        {
          title: '\u7EC4\u4EF6',
          key: 'component',
        },
        compCategoryOrder
          ? getComponentsMenuGroups(
              componentDatas,
              compCategoryOrder,
              compSorterType
            )
          : getComponentsMenuList(componentDatas, compSorterType)
      )
    )
  );
}

var _default = _react['default'].memo(ComponentsMenu);

exports['default'] = _default;
