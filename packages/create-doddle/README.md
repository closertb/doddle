## create-doddle

一个简易的脚手架，一键创建一个简易的 react 项目； 使用了 ES7 语法，且未编译，所以 node 支持版本为 8 以上

## 操作指南

```sh
// 全局化安装引用
npm install create-doddle -g

create-doddle [options] templateType projectName
// 使用npx引用
npx create-doddle [options] templateType projectName
```

templateType(模板类型)，有四种模板可选：

- react 入门级 react 模板
- dva dva 模板
- antd 中后台项目模板
- github（github issue 展示博客模板）
- vue (暂无)
- h5 (暂无)
- ssr（ssr 服务端渲染模板，还不成熟）

projectName(项目名称)，基于当前命令执行路径，并将模板拷贝到这个项目文件夹下

options(可选参数)：

- -f: 强制删除当前命令执行路径下已存在的 projectName 文件夹；
- -h：帮助，commander 原生提供

## 原理介绍

文章：[前端脚手架，听起来玄乎，实际呢？][1]

[1]: https://github.com/closertb/MyBlog/issues/27
