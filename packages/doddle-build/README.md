## doddle-build

一个 webpack 构建工具，思路来自于 react-scripts

## 操作指南

1. 安装

```shell
npm install @doddle/doddle-build --save-dev
```

2. pacckage.json 的 scripts 加编译命令

```javascript
scripts: {
  "start": "doddle-build start --port 8903",  // 本地开发环境
  "dev": "doddle-build dev",        // 线上开发环境
  "qa": "doddle-build qa",         // 线上测试环境
  "prod": "doddle-build prod ",  // 线上正式环境
}
```

不同的编译指令将有一个全局变量 process.env.NODE_ENV 进行区分，其值分别对应 local,dev,qa,prod

## 待开发功能

1. 运行端口检测？
2. proxy 支持

## 遇到的难点

1. 热更新通信未启动（live reload），原因是 WebpackDevServer 调用时需要指定 ServerEntrypoints，需要调用 addDevServerEntrypoints 将 hotServer 的配置手动注入到 webpack Config 的配置中；
   在[stackoverflow][2]有人提了出来,在[官方文档][1]给出了解决方案
2. 关于 splitChunks 的使用，由于 http1.1 以后支持了多路复用，即一次可以多个请求同时发出。所以以前提出的构建打包成 css + js + css 三个文件的方案放在现在不是那么合适，我们可以将 css 与 js 拆成更多的包，4 个或者 6 个，特别是有 antd 这种大的 ui 项目时，可以把 react 全家桶打成一个包，将 antd 及其周边打成一个包， 详见 webpack.config.js；[参考文章][3]
3. 热更新不生效，无法做到不刷新页面更新：当把 contentBase 修复成和 compile out（dist）一致时，样式能做到热更新；而 Js 仍然是哪个叼样；要解决这个，是个大工程（可参见 react-hot-loader）。[参考文章][4], [分析文章][5]

## 可配置项

通过在 package.json 中添加 webpack 属性，像这样：

```js
  "devDependencies": {
    "@doddle/doddle-build": "^1.0.3",
    "@doddle/eslint-config-doddle": "~0.0.13"
  },
  "webpack": {
    "copyPublic": true
  },
```

支持五种配置，如下所示：
**config 参数**

| 参数              | 说明                                             | 类型    | 默认值      |
| ----------------- | ------------------------------------------------ | ------- | ----------- |
| title             | 网站 title                                       | string  | doddle site |
| useEslint         | 编译时是否开启 Eslint 检查                       | boolean | false       |
| useAnalyse        | 是否开启打包图谱分析                             | boolean | false       |
| useAntd           | 是否使用了 antd,使用了 antd 会单独打包           | boolean | false       |
| copyPublic        | 是否复制 public 文件夹下的文件到打包到 dist 目录 | boolean | false       |
| publicResolvePath | 打包到 dist 目录的路径, 默认 dist 根路径         | string  | './'        |
| publicPath        | 静态资源路径                                     | string  | './'        |

**cmd 参数**

```sh
doddle-build start --port 8906 // 指定端口

// 以下三个参数，主要针对的是SSR打包的支持
doddle-build dev --entry index --dist public --template none 指定了很多个变量
```

| 参数     | 说明                                                 | 类型    | 默认值 |
| -------- | ---------------------------------------------------- | ------- | ------ |
| port     | 端口，仅适用于 start                                 | string  | 3000   |
| open     | 是否打开浏览器，仅适用于 start                       | boolean | false  |
| entry    | 入口文件，不适用于 start                             | string  | index  |
| dist     | 打包目标文件夹，不适用于 start                       | string  | dist   |
| template | 是否输出 html 文件，为 none 时不输出，不适用于 start | string  | yes    |

## changeLog

- 2019-09-01: 添加动态 title 配置支持，修复 css HMR

- 2019-10-06: 添加 public 文件夹拷贝支持，完善 readme 支持

- 2019-10-22: 添加对 ssr 模式打包的支持，即支持入口指定，编译输出文件夹指定等特性

- 2020-04-01: 添加对 webpack.config.js 自定义配置的支持，支持微前端 react 子项目打包; 增加 wepack useMicroMode 配置

[1]: https://webpack.js.org/guides/hot-module-replacement/
[2]: https://stackoverflow.com/questions/52818569/webpack-dev-server-hot-reload-doesnt-work-via-node-api
[3]: https://medium.com/dailyjs/webpack-4-splitchunks-plugin-d9fbbe091fd0
[4]: https://webpack.js.org/concepts/hot-module-replacement/
[5]: https://segmentfault.com/a/1190000005614604?utm_source=tuicool&utm_medium=referral
