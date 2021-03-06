#!/usr/bin/env node
/**
 * Copyright (c) 2019-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const ArgStart = 2;

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

const spawn = require('cross-spawn');
const args = process.argv.slice(ArgStart);

// console.log('args', args);
// 寻找有效参数
const scriptIndex = args.findIndex(
  x => x === 'dev' || x === 'qa' || x === 'pub' || x === 'start'
);

/* // 寻找有效参数
const protIndex = args.findIndex(x => ~x.indexOf('port')); */

/**
 * nodeArgs 支持的参数
 * @params  port 端口        仅适用于npm start
 * @params  entry 编译入口   不适用于start
 * @params  dist  编译出口   不适用于start
 */

const script = scriptIndex === -1 ? args[0] : args[scriptIndex];
const nodeArgs = scriptIndex > 0 ? args.slice(0, scriptIndex) : [];
switch (script) {
  case 'dev':
  case 'qa':
  case 'pub':
  case 'start': {
    // 参数拼接
    // eg: node ../scripts/start args;
    const result = spawn.sync(
      'node',
      nodeArgs
        .concat(require.resolve('../scripts/' + script))
        .concat(args.slice(scriptIndex + 1)),
      { stdio: 'inherit' }
    );
    // 写环境变量
    process.env.DEPLOY_ENV = script;
    if (result.signal) {
      if (result.signal === 'SIGKILL') {
        console.log(
          'The build failed because the process exited too early. ' +
            'This probably means the system ran out of memory or someone called ' +
            '`kill -9` on the process.'
        );
      } else if (result.signal === 'SIGTERM') {
        console.log(
          'The build failed because the process exited too early. ' +
            'Someone might have called `kill` or `killall`, or the system could ' +
            'be shutting down.'
        );
      }
      process.exit(1);
    }
    process.exit(result.status);
    break;
  }
  default:
    console.error('Unknown script "' + script + '".');
    console.log('Perhaps you need to update doddle-build?');
    // console.log(
    //   'See: https://facebook.github.io/create-react-app/docs/updating-to-new-releases'
    // );
    break;
}
