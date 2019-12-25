import compose from '../src/utils';

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
