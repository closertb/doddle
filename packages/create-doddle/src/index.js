const fs = require('fs-extra');
const chalk = require('chalk');
const utils = require('./utils');

const red = chalk.red;
const green = chalk.green;
const { currentPath, downloadByGit } = utils;
let forceDel = false;
let branchName;
let projectName;
let fileTempName;

// 重写package.json
async function rewriteJson() {
  try {
    const path = currentPath + projectName + '/package.json';
    const isExist = await fs.pathExists(path);
    if (!isExist) {
      return;
    }
    const json = await fs.readJson(path);
    json.name = projectName;
    json.title = `${projectName} site`;
    json.description =
      fileTempName === 'template'
        ? `this project is based on template of branch ${branchName}`
        : `this project is copy from ${branchName.git}`;
    await fs.writeJson(path, json, { spaces: '\t' });
    console.log(green('format package.json success!'));
  } catch (err) {
    console.error(red(err));
  }
}

// 删除不相关的文件
async function unrelatedFileRemove(parentFile, callback) {
  try {
    await fs.remove(parentFile + '/.git');
    await fs.remove(parentFile + '/package-lock.json');
    callback && callback();
    rewriteJson();
    console.log(green('remove unrelated file success!'));
  } catch (err) {
    console.error(red(err));
  }
}

// 重命名gitClone下来的文件为项目文件名
async function renameFile(fileName = 'template') {
  fileTempName = fileName;
  const oldPath = currentPath + fileName;
  const nowPath = currentPath + projectName;
  try {
    await fs.rename(oldPath, nowPath);
    unrelatedFileRemove(nowPath);
  } catch (error) {
    console.error(red(error));
  }
}

async function create(temp, project, force = false, otherUrl) {
  // branchName 有可能是一个git下载地址
  branchName = temp;
  projectName = project;
  forceDel = force;
  const file = currentPath + projectName;
  try {
    // 检测项目文件夹是否已存在， 若存在，抛出错误
    const res = await fs.pathExists(file);
    if (res) {
      if (forceDel) {
        console.log(green('force remove the exist directory'));
        await fs.remove(file);
        downloadByGit(renameFile, branchName);
      } else {
        console.log(
          chalk.red(
            'Error, In this directory, the project name already exsits !'
          )
        );
        console.log(
          chalk.green('you can use option -f to force delete the directory !')
        );
      }
      return;
    }
    // 若不存在，直接从git下载
    downloadByGit(renameFile, branchName);
  } catch (err) {
    console.error(red(err));
  }
}

module.exports = create;
