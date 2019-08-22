## create-doddle

一个简易的脚手架，一键创建一个简易的 react 项目； 使用了 ES7 语法，且未编译，所以 node 版本为 8 最好

## 操作指南

```shell
// 全局化安装引用
npm install create-doddle -g

create-doddle [options] templateType projectName
// 使用npx引用
npx create-doddle [options] templateType projectName
```

templateType(模板类型)，有四种模板可选：

- react
- dva
- vue (暂无)
- h5 (暂无)

projectName(项目名称)，基于当前命令执行路径，并将模板拷贝到这个项目文件夹下

options(可选参数)：

- -f: 强制删除当前命令执行路径下已存在的 projectName 文件夹；
- -h：帮助，commander 原生提供

## 原理介绍

文章：[前端脚手架，听起来玄乎，实际呢？][1]

[1]: https://segmentfault.com/a/1190000016915868
