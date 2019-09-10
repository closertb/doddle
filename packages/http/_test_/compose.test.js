import compose from '../src/utils';
import {
  addRequestDomain,
  addRequestQuery,
  responseStatusHandle,
  responseContentHandle,
} from '../src/middlewares';

let context = {
  data: [],
};

async function middleware1(ctx, next) {
  console.log('action 001');
  ctx.data.push(1);
  await next();
  console.log('action 006');
  ctx.data.push(6);
}

async function middleware2(ctx, next) {
  console.log('action 002');
  ctx.data.push(2);
  await next();
  console.log('action 005');
  ctx.data.push(5);
}

async function middleware3(ctx, next) {
  console.log('action 003');
  ctx.data.push(3);
  await next();
  console.log('action 004');
  ctx.data.push(4);
}

const middwares = [middleware1, middleware2, middleware3];

test('base function test', () => {
  return compose(middwares)(context)
    .then(() => context.data)
    .then(data => expect(data).toStrictEqual([1, 2, 3, 4, 5, 6]));
});

/* 全流程测试 */
export async function fetchRequestMock(ctx, next) {
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
      }, 200);
    });
    return next();
  } catch (error) {
    return Promise.reject(error);
  }
}

let fetchCompose = compose([
  addRequestDomain,
  addRequestQuery,
  fetchRequestMock,
  responseStatusHandle,
  responseContentHandle,
]);
let ctx = {
  key: 'content',
  domain: 'http://closertb.site',
  url: '/getUserlist',
  queryParams: { token: 123456 },
  params: { pn: 10 },
  options: {},
};

test('the whole fetch compose test', async () => {
  await fetchCompose(ctx);
  expect(ctx.data.url).toEqual('http://closertb.site/getUserlist?token=123456');
}, 8000);
