const crossSpawn = require('cross-spawn');
const spawn = crossSpawn.sync;
const chalk = require('chalk');
const red = chalk.red;
const green = chalk.green;

function isWindows() {
  if (typeof process === 'undefined' || !process) {
    return false;
  }
  return (
    process.platform === 'win32' ||
    process.env.OSTYPE === 'cygwin' ||
    process.env.OSTYPE === 'msys'
  );
}

function downloadByGit(callback, branch) {
  console.log(green('start download:', `${branch} template`));
  const result = spawn(
    'git',
    ['clone', `-b ${branch}`, 'https://github.com/closertb/template.git'],
    { stdio: 'inherit' }
  );
  const error = result.error;
  if (error) {
    console.log(red(error));
    return;
  }
  callback && callback();
}

const currentPath = process.cwd().replace(/\\/g, '/') + '/';

module.exports = {
  downloadByGit,
  isWindows,
  currentPath,
};
