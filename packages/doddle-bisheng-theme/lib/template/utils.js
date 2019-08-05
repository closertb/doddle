'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.isComponentPage = isComponentPage;
exports.combineChangelogPage = combineChangelogPage;
exports.normalizeData = normalizeData;
var normalized = Symbol('normalized');
/* eslint-disable no-prototype-builtins */

function isComponentPage(pageData) {
  // eslint-disable-next-line no-prototype-builtins
  return (
    pageData.hasOwnProperty('demo') ||
    !(
      pageData.hasOwnProperty('meta') &&
      pageData.hasOwnProperty('content') &&
      pageData.hasOwnProperty('toc')
    )
  );
}

function combineChangelogPage(pageData) {
  // 如果同时存在meta、content、toc则为文档类的数据，非组件文档
  if (
    pageData.hasOwnProperty('meta') &&
    pageData.hasOwnProperty('content') &&
    pageData.hasOwnProperty('toc')
  ) {
    return;
  }

  var keys = Object.keys(pageData).filter(function(x) {
    return x !== 'demo';
  });
  var majorKey = keys.find(function(key) {
    return pageData[key].meta.title;
  });
  var majorPageData = pageData[majorKey];
  var changelogKey = 'CHANGELOG';
  var changelogPageData = pageData[changelogKey];

  if (changelogPageData) {
    majorPageData.changelog = 'what'; // transformChangelog(changelogPageData.content);

    delete pageData[changelogKey];
  }
}

function getUniquePageKey(pageData) {
  return Object.keys(pageData).find(function(key) {
    return key !== 'demo';
  });
}

function getUniquePageData(pageData) {
  return pageData[getUniquePageKey(pageData)];
}

function normalizeData(data) {
  var componentDataKey = Object.keys(data).find(function(key) {
    var item = data[key];
    return Object.keys(item).find(function(pageKey) {
      return isComponentPage(item[pageKey]);
    });
  });

  if (!componentDataKey) {
    return;
  }

  var componentDatas = data[componentDataKey];

  if (componentDatas[normalized]) {
    return;
  } // Object.keys(componentDatas).forEach(key => combineChangelogPage(componentDatas[key]));

  var arr = Object.values(componentDatas);

  for (var i = 0; i < arr.length; i += 1) {
    var pageData = arr[i];
    var realPageKey = getUniquePageKey(pageData);
    var realPageData = getUniquePageData(pageData); // const demoData = pageData.demo;

    Object.assign(pageData, realPageData);
    delete pageData[realPageKey];
  }

  componentDatas[normalized] = true;
}
