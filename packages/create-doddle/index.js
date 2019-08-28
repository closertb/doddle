#!/usr/bin/env node

/**
 * Copyright (c) Mr Denzel.
 **/

const commander = require('commander');
const chalk = require('chalk');
const packageJson = require('./package.json');
const excute = require('./src/index');

// 四种模板。对应我git仓库四个仓库地址
const tempIndex = {
  react: 'react', // react 模板
  vue: 'master', // vue 模板
  antd: 'antd', // 中后台项目模板
  h5: 'master', // h5模板
  dva: 'dva', // dva模板
};

let projectName;
let templateName;
let inputIndex;
const program = new commander.Command(packageJson.name)
  .version('v' + packageJson.version, '-v, --version')
  .option('-f, --force', 'force delete the exist director')
  .option('-d, --directly', 'copy the not specified template')
  .arguments('<templateName>')
  .arguments('<projectName>')
  .alias('cp')
  .description('doddle-create react myProject')
  .action(function(index, name) {
    inputIndex = index;
    // 允许目标项目名和要复制的模板类型名顺序颠倒
    if (tempIndex[index] || tempIndex[name]) {
      if (tempIndex[index]) {
        templateName = tempIndex[index] || 'master';
        projectName = name;
      } else {
        templateName = tempIndex[name] || 'master';
        projectName = index;
      }
    }
    if (program.directly) {
      templateName = index;
    }
  });
program.parse(process.argv);

if (program.args.length === 0) {
  console.log(chalk.red('syntax error'));
  program.help();
}

if (templateName) {
  excute(templateName, projectName, program.force);
} else {
  console.log(`the template ${inputIndex} you want download do not exist`);
}
