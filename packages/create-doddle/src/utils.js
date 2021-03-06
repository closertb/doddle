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
  let branchName = branch;
  let fileName = 'template';
  let gitUrl = 'https://github.com/closertb/template.git';
  const isValidGitUrl = typeof branch === 'object';
  // 如果branch是一个有效的git下载地址；
  if (isValidGitUrl) {
    branchName = branch.branch;
    fileName = branch.name;
    gitUrl = branch.git;
  }
  console.log(
    green(`start download:, ${fileName} from ${gitUrl} of branch ${branchName}`)
  );
  const result = spawn('git', ['clone', '-b', `${branchName}`, gitUrl], {
    stdio: 'inherit',
  });
  const error = result.error;
  if (error) {
    console.log(red(error));
    return;
  }
  callback && callback(fileName);
}

const currentPath = process.cwd().replace(/\\/g, '/') + '/';

module.exports = {
  downloadByGit,
  isWindows,
  currentPath,
};
