## doddle-build

一个 webpack 构建工具，类似于 react-scripts

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
