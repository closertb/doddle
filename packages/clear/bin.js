#!/usr/bin/env node

/**
 * Copyright (c) Mr Doddle.
 **/
const commander = require('commander');
const path = require('path');
const util = require('util');
const chalk = require('chalk');
const fs = require('fs');
const prm = util.promisify(fs.rmdir);
const preaddir = util.promisify(fs.readdir);

const packageJson = require('./package.json');

// 命令系统: https://www.npmjs.com/package/commander
const program = new commander.Command(packageJson.name)
  .command('do-clear programPath')
  .description('clear node_mudules of the folder')
  .version('v' + packageJson.version, '-v, --version')
  .option('-s, --single', 'only remove the current path')
  .arguments('<programPath>');

program.parse(process.argv);

const [_projectPath] = program.args;
const currentPath = process.cwd(); // path.resolve();


// 如果没有设置projectPath, 则默认当前命令项目路径为聚合项目的
const projectPath = _projectPath ? path.resolve(currentPath, _projectPath) : currentPath;

async function clear(path, deepth) {
  // 没有明确当前是否是文件时，就需要检测是否是文件夹
  if (fs.lstatSync(path).isDirectory()) {
    if (/\/node_modules$/.test(path)) {
      await prm(path);
      return;
    }

    if (deepth <= 0) {
      return;
    }

    const files = await preaddir(path);
    await Promise.all(files.map(async (_path) => {
      await clear(path.concat('/', _path), deepth--);
      return;
    }));
  }
  return;
}


(async () => {
  console.log(chalk.green(`rm node_modules at: ${projectPath}....`));
  await clear(projectPath, program.single ? 1 : 999);
  console.log(chalk.green(`job finish`));
})()