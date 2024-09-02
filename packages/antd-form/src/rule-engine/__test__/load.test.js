/**
 * @jest-environment jsdom
 */

import { getResourceDepsArr, loadResourceMap, preloadResoures, stepLoadResource } from '../../logic/load';

const resources = [
  {
    "name": "@alife/alsc-saas-boh-operate-coms",
    "urls": [
      "https://dev.g.alicdn.com/code/npm/@alife/alsc-saas-boh-operate-coms/1.0.0/library/umd/index-min.js",
      "https://dev.g.alicdn.com/code/npm/@alife/alsc-saas-boh-operate-coms/1.0.0/library/umd/index.css",
    ],
    "library": "BohOperate",
    "version": "1.0.0-beta.76",
    "type": "normal",
    "assetsBundle": [{
      "library": "CookMixin",
      "urls": [
        "https://dev.g.alicdn.com/code/npm/@alife/cook-design-mixin/1.6.1/library/umd/index-min.js",
        "https://dev.g.alicdn.com/code/npm/@alife/cook-design-mixin/1.6.1/library/umd/index.css"
      ],
    }]
  },
  {
    "name": "@alife/cook-design-mixin",
    "urls": [
      "https://dev.g.alicdn.com/code/npm/@alife/cook-design-mixin/1.6.1/library/umd/index-min.js",
      "https://dev.g.alicdn.com/code/npm/@alife/cook-design-mixin/1.6.1/library/umd/index.css",
    ],
    "library": "CookMixin",
    "version": "1.6.1-beta.39",
    "type": "normal",
    "assetsBundle": [{
      "type": 'other',
      "name": 'cookd',
      "library": 'cookd',
      "urls": [
        'https://g.alicdn.com/code/npm/@alife/cook-design/1.0.5/library/umd/cookd-min.js',
        'https://g.alicdn.com/code/npm/@alife/cook-design/1.0.5/library/umd/cookd.variable.css',
      ],
    }]
  },
  {
    "name": "@alife/form-basic-assets",
    "urls": [
     "https://dev.g.alicdn.com/code/npm/@alife/form-basic-assets/1.0.0/library/umd/index-min.js"
    ],
    "library": "FormBasicMethod",
    "version": "1.0.0-beta.8",
    "type": "method"
   },
   {
    "name": "@alife/alsc-saas-boh-operate-utils",
    "urls": [
     "https://dev.g.alicdn.com/code/npm/@alife/alsc-saas-boh-operate-utils/1.0.0/library/umd/index-min.js"
    ],
    "library": "BohOperateUtils",
    "version": "1.0.0-beta.13",
    "type": "method"
   }
];

const preLoadLink = [];
const styleLink = [];
const scriptLink = [];
// 模拟document
// beforeEach(() => {
//   global.document = {
//     createElement: () => {
//       return {
//         onload: (resolve) => setTimeout(() => resolve(), 100),
//       }
//     },
//     head: {
//       appendChild: (child) => {
//         if (child.rel === 'preload') {
//           preLoadLink.push(child);
//           return;
//         }

//         if (child.rel === 'stylesheet') {
//           styleLink.push(child);
//           return;
//         }

//         scriptLink.push(child);
//         child.onload();
//       }
//     }
//   };

//   global.window = {
//     document,
//   };
// });

describe('装修资源加载测试', () => {
  const results = loadResourceMap(resources);
  const resouresSort = Array.from(results.values());
  const resultDepsArr = getResourceDepsArr(resouresSort);
  // let hasReset = false;
  beforeAll(() => {
    // if (hasReset) return;
    // hasReset = true;
    global.document.createElementOrigin = global.document.createElement;
    global.document.createElement = (...args) => {
      const element = global.document.createElementOrigin(...args);
      setTimeout(() => {
        // console.log('url:', element.onload, element.src);
        if (element.onload) {
          console.log('load script:', element.src, 'at time', new Date());
          element.onload(true);
        }
      }, 1005);
      return element;
    }
  });
  test('测试铺平后map的宽度', async () => {      
    // console.log(results);
    expect(results.size).toEqual(resources.length + 1);
  });
  
  test('测试层级', async () => {
    console.log(resultDepsArr);
    expect(resultDepsArr.length).toEqual(3);
  });

  test('测试预加载', async () => {
    // console.log(results);
    preloadResoures(resouresSort);
    expect([document.querySelectorAll('link[rel="preload"]').length, document.querySelectorAll('link[rel="stylesheet"]').length]).toEqual([resources.length + 1, 3]);
  });

  test('测试分布加载', async () => {
    // console.log(results);
    await stepLoadResource(resultDepsArr);
    expect(document.querySelectorAll('script').length).toEqual(resources.length + 1);
  }, 10000);

  afterAll(() => {
    global.document.createElement = global.document.createElementOrigin;
    document.querySelectorAll('script').forEach(node => document.head.removeChild(node));
    document.querySelectorAll('link').forEach(node => document.head.removeChild(node));
  });
});

describe('装修资源加载测试，window有资源', () => {
  // let hasReset = false;
  global.document.createElementOrigin = global.document.createElement;

  beforeAll(() => {
    // if (hasReset) return;
    // hasReset = true;
    global.document.createElement = (...args) => {
      const element = global.document.createElementOrigin(...args);
      setTimeout(() => {
        // console.log('url:', element.onload, element.src);
        if (element.onload) {
          console.log('load script:', element.src, 'at time', new Date());
          element.onload(true);
        }
      }, 1005);
      return element;
    }
    // 资源
    global.window.cookd = { Mock: false };
    global.window.CookMixin = { Mock: false };
  });

  test('测试铺平后map的宽度', async () => {   
    const results = loadResourceMap(resources); 
    const uneedLoadResource = Array.from(results.values()).filter(resource => resource.loaded)
    // console.log(results);
    expect(results.size).toEqual(resources.length + 1);
    expect(uneedLoadResource.length).toEqual(2);
  });

  test('测试预加载', async () => {
    const results = loadResourceMap(resources);
    const resouresSort = Array.from(results.values());
    // console.log(results);
    preloadResoures(resouresSort);
    expect(document.querySelectorAll('link[rel="preload"]').length).toEqual(resources.length - 1);
    expect(document.querySelectorAll('link[rel="stylesheet"]').length).toEqual(1);
  });
  
  test('测试层级', async () => {
    const results = loadResourceMap(resources);
    const resouresSort = Array.from(results.values());
    const resultDepsArr = getResourceDepsArr(resouresSort);
    // console.log(resultDepsArr);
    expect(resultDepsArr.length).toEqual(1);
  });

  test('测试分布加载', async () => {
    const results = loadResourceMap(resources);
    const resouresSort = Array.from(results.values());
    const resultDepsArr = getResourceDepsArr(resouresSort);
    // console.log(results);
    await stepLoadResource(resultDepsArr);
    expect(document.querySelectorAll('script').length).toEqual(resources.length - 1);
  }, 10000);
  afterAll(() => {
    global.document.createElement = global.document.createElementOrigin;
    global.document.write('');
  });
});
