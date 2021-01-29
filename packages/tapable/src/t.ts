/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { SyncBailHook, SyncLoopHook, SyncHook, SyncWaterfallHook } from '.';

function start() {
  const hook = new SyncLoopHook();
  let idx = 0;
  hook.tap('a', () => {
    console.log('2');
    if (idx < 10) {
      idx++;
      return true;
    }
    return undefined;
  });
  hook.tap('a', () => {
    console.log('1');
  });
  hook.call();
  // console.log(hook.call.toString());
  // hook.call();
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
