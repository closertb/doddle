// 常用post提交type及对应的dataFormat
const enums = {
  'application/x-www-form-urlencoded': data => JSON.stringify(data),
  'multipart/form-data': data =>
    Object.keys(data).reduce((prev, key) => {
      prev.append(key, data[key]);
      return prev;
    }, new FormData()),
  'application/json': data => JSON.stringify(data),
};

function genHeader(contentType = 'form', data, options, method?) {
  const format = enums[contentType] || enums['application/json'];
  const body = {
    method: method || 'POST',
    body: format(data),
    ...options,
    headers: {
      'Content-Type': contentType,
      ...options.headers,
    },
  };
  if (contentType === 'multipart/form-data') {
    // fetch 的post Multipart设置，不能设置header的Content-type,否则会造成无Boundry
    delete body.headers['Content-Type'];
  }
  return body;
}

export const toStringify = (params = {}) => {
  const keys = Object.keys(params).filter(key => params[key] !== undefined);
  if (keys.length) {
    return keys.map(key => `${key}=${params[key]}`).join('&');
  }
  return '';
};

export const requestMethods = {
  get(url, data, options) {
    const _params = toStringify(data);

    return fetch(
      _params ? `${url}?${_params}` : url,
      {
        method: 'GET',
        ...options,
        headers: {
          ...options.headers,
        },
      });
  },
  post(url, data, options) {
    const { type = 'application/json', query, ...others } = options;
    const _params = toStringify(query);
    return fetch(_params ? `${url}?${_params}` : url, genHeader(type, data, others, 'POST'));
  },
  put(url, data, options) {
    const { type = 'application/json', query, ...others } = options;
    const _params = toStringify(query);
    return fetch(_params ? `${url}?${_params}` : url, genHeader(type, data, others, 'POST'));
  },
  delete(url, data, options) {
    const { type = 'application/json', query, ...others } = options;
    const _params = toStringify(query);
    return fetch(_params ? `${url}?${_params}` : url, genHeader(type, data, others, 'delete'));
  },
};

export function resFormat(res) {
  if (res.success !== undefined) {
    return res;
  }

  const { result, ...others } = res;

  return {
    success: true,
    data: {
      body: result,
      header: {
        ...others,
      },
      success: true,
      ...others,
    }
  };
} 
export function defaultErrorHandler(error) {
  if (
    error.message &&
    error.message.toUpperCase().includes('FAILED TO FETCH')
  ) {
    // eslint-disable-next-line no-alert
    console.error('网络错误，请检查后重试');
  }
  return Promise.reject({
    success: false,
    error,
  });
}
