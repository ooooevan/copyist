/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-implied-eval */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  SyncBailHook,
  SyncLoopHook,
  AsyncParallelBailHook,
  AsyncParallelHook,
  SyncHook,
  SyncWaterfallHook,
  AsyncSeriesHook,
  AsyncSeriesBailHook,
  AsyncSeriesWaterfallHook,
} from '.';

function start() {
  const hook = new AsyncSeriesWaterfallHook(['x']);

  hook.callAsync(1, (e) => {
    console.log('call,', e);
  });

  // await new Promise((resolve) => {
  //   hook.callAsync(1, () => {
  //     resolve(1);
  //   });
  // });
  // hook.callAsync(() => {
  //   console.log('aaa');
  // });
  // await new Promise<void>((resolve) => {
  //   hook.callAsync(() => {
  //     console.log('callasync');
  //     resolve();
  //   });
  // });
  console.log(hook.callAsync.toString());
  // console.log(hook.callAsync.toString());
  // const h1 = new SyncBailHook(['a']);
  // const r = h1.call(1);
  // console.log(r === undefined);
  // h1.tap('A', () => undefined);

  // console.log(h1.call(1) === undefined);
  // console.log((await h1.promise(1)) === undefined);
  // h1.callAsync(1, console.log);

  // h1.tap('B', (a) => `ok${a}`);
  // console.log(h1.call(10) === 'ok10');
  // console.log(await h1.promise(10));
  // console.log(h1.promise.toString());

  // ).toEqual('ok10');
}

start();
// .then((r) => {
//   console.log('r', r);
// })
// .catch((e) => {
//   console.log('e', e);
// });
// console.log(hook.call.toString());

// function anonymous(arg1, arg2, arg3) {
//   let _context;
//   const { _x } = this;
//   return new Promise((_resolve, _reject) => {
//     let _sync = true;
//     function _error(_err) {
//       if (_sync)
//         _resolve(
//           Promise.resolve().then(() => {
//             throw _err;
//           }),
//         );
//       else _reject(_err);
//     }
//     const _fn0 = _x[0];
//     let _hasError0 = false;
//     try {
//       _fn0(arg1, arg2, arg3);
//     } catch (_err) {
//       _hasError0 = true;
//       _error(_err);
//     }
//     if (!_hasError0) {
//       const _fn1 = _x[1];
//       let _hasError1 = false;
//       try {
//         _fn1(arg1, arg2, arg3);
//       } catch (_err) {
//         _hasError1 = true;
//         _error(_err);
//       }
//       if (!_hasError1) {
//         _resolve();
//       }
//     }
//     _sync = false;
//   });
// }
