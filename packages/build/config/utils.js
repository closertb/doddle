function isSameObject(last, current) {
  if (!last) {
    // 首次为空
    return false;
  }
  return Object.keys(current).every(key => current[key] === last[key]);
}

const ArgStart = 2;

function getArgs() {
  return process.argv.slice(ArgStart).reduce((pre, cur, index, arr) => {
    if (~cur.indexOf('--')) {
      pre[cur.replace(/-/g, '')] = arr[index + 1];
    }
    return pre;
  }, {});
}

module.exports = {
  isSameObject,
  getArgs,
};
