function isSameObject(last, current) {
  if (!last) {
    // 首次为空
    return false;
  }
  return Object.keys(current).every(key => current[key] === last[key]);
}

// console.log('res:', isSameObject(initConfig, initConfig));
module.exports = {
  isSameObject,
};
