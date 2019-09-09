import qs from 'qs';
/**
 *
 * @param {*} ctx:  指的是根据httpInstance.create 产生的示例
 * @param {*} next：指下一个要执行的中间件；
 */
export function addRequestDomain(ctx, next) {
  const { domain } = ctx;
  ctx.url = `${domain}${ctx.url}`;
  return next();
}

export function addRequestQuery(ctx, next) {
  const {
    tokens = {},
    options: { ignoreQuery = false },
  } = ctx;
  ctx.url = ignoreQuery ? ctx.url : `${ctx.url}?${qs.stringify(tokens)}`;
  return next();
}

export async function fetchRequest(ctx, next) {
  const { url, params } = ctx;
  try {
    ctx.response = await fetch(url, params);
    return next();
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function responseStatusHandle(ctx, next) {
  const { response = {} } = ctx;
  if (response.ok) {
    ctx.data = await response.json();
    ctx._response = ctx.data;
    return next();
  } else {
    console.error('errorhandle');
  }
}

export function responseContentHandle(ctx, next) {
  const { key, _response } = ctx;
  ctx.data = key ? _response[key] : _response;
  return next();
}
