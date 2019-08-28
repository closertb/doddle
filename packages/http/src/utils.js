// 把对象转换为FormData
export function toFormData(originData) {
  if (!originData) return null;

  const formData = new FormData();
  function transformToFormData(formData, data, parentKey) {
    if (
      data &&
      typeof data === 'object' &&
      !(data instanceof Date) &&
      !(window.File && data instanceof window.File)
    ) {
      Object.keys(data).forEach(key => {
        let tempKey;
        if (Array.isArray(data)) {
          tempKey = parentKey ? `${parentKey}[${key}]` : key;
        } else {
          tempKey = parentKey ? `${parentKey}.${key}` : key;
        }
        transformToFormData(formData, data[key], tempKey);
      });
    } else {
      const value = data === null ? '' : data;
      formData.append(parentKey, value);
    }
  }
  transformToFormData(formData, originData);
  return formData;
}

export function getDeployEnv(deployEnv) {
  // 由于公共组件内部与业务项目使用的getRuntimeEnv为不同的函数，故需要使用window全局变量来保持数据一致
  if (arguments.length) {
    window.$$cachedEnv =
      window.DEPLOY_ENV ||
      deployEnv ||
      localStorage.getItem('DEPLOY_ENV') ||
      'dev';
  }
  return window.$$cachedEnv;
}
