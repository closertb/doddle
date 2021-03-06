import Http from '../src';

/* 全流程测试 */
async function fetchRequestMock(ctx, next) {
  const { url, params } = ctx;
  try {
    ctx.response = await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({
          ok: true,
          json: () => ({
            status: 'ok',
            content: {
              url,
              params,
            },
          }),
        });
      }, 50);
    });
    return next();
  } catch (error) {
    return Promise.reject(error);
  }
}

const servers = {
  mock: 'http://closertb.site',
  other: 'http://doc.closertb.site',
};

const http = Http.create({
  servers,
  contentKey: 'content',
  bodyParam: {
    mode: 'cors',
  },
  query: () => ({ token: 123456 }),
});

http.use(fetchRequestMock, 2, 1);

const { post, get } = http.create('mock');

const httpWith = Http.create({
  servers,
  contentKey: 'content',
  query: () => ({ token: 123456 }),
});

httpWith.use(fetchRequestMock, 2, 1);

const { get: getWith } = httpWith.create('mock');

export function loginWith(param) {
  return getWith('/user/login', {
    ...param,
  });
}

export function login(param) {
  return get(
    '/user/login',
    {
      ...param,
    },
    { ignoreQuery: true }
  );
}

export function query(param) {
  return get('/user/query', {
    ...param,
  });
}

export function postData(param) {
  return post('/user/query', {
    ...param,
  });
}

export function postJsonData(param) {
  return post(
    '/user/query',
    {
      ...param,
    },
    { type: 'json', mode: 'no-cors' }
  );
}

export function postFormData(param) {
  return post(
    '/user/query',
    {
      ...param,
    },
    { type: 'formData', headers: { 'Set-Cookie': false } }
  );
}

test('mock a get request with no cors mode set', async () => {
  const data = await loginWith({ name: 'denzel' });
  expect(data.params.mode).toEqual(undefined);
}, 100);

test('mock a get request with right request url and ignore query params', async () => {
  const data = await login({ name: 'denzel' });
  expect(data.url).toEqual('http://closertb.site/user/login?name=denzel');
}, 100);

test('mock a get request with right request url with query params', async () => {
  const data = await query({ name: 'denzel', age: 18 });
  expect(data.url).toEqual(
    'http://closertb.site/user/query?name=denzel&age=18&token=123456'
  );
}, 100);

test('mock a post request with right request url and request body', async () => {
  const data = await postData({ name: 'denzel', age: 18 });
  expect(data.url).toEqual('http://closertb.site/user/query?token=123456');
  expect(data.params.body).toEqual('name=denzel&age=18');
}, 100);

test('mock a post request of json post type with request body', async () => {
  const data = await postJsonData({ name: 'denzel', age: 18 });
  expect(data.params.body).toEqual(JSON.stringify({ name: 'denzel', age: 18 }));
  expect(data.params.headers['Content-Type']).toEqual('application/json');
  expect(data.params.mode).toEqual('no-cors');
}, 100);

test('mock a post request of from post type with request body', async () => {
  const data = await postFormData({ name: 'denzel', age: 18 });
  expect(data.params.body instanceof FormData).toEqual(true);
}, 100);

// request init headers 未设置Content-type
// request init body mode属性设置为cors
// request init headers extendOption属性设置Ok
test('mock a post request with request headers', async () => {
  const data = await postFormData({ name: 'denzel' });
  expect(data.params.headers['Content-Type']).toEqual(undefined);
  expect(data.params.headers['Set-Cookie']).toEqual(false);
  expect(data.params.mode).toEqual('cors');
}, 100);
