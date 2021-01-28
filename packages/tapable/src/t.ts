/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { SyncBailHook, SyncHook, SyncWaterfallHook } from '.';

function start() {
  const h3 = new SyncHook(['test', 'arg2', 'arg3']);

  const mock4 = () => 0;
  const mock5 = () => 0;

  h3.tap('E', mock4);
  h3.tap('F', mock5);
  h3.call('1', 2, 3);
  console.log(h3.call.toString());
  // console.log('promise', hook.promise.toString());
  // console.log(hook.callAsync.toString());
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
