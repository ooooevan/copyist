/* eslint-disable @typescript-eslint/ban-types */
import { SyncBailHook } from './SyncBailHook';

function pify(fn: Function) {
  return new Promise((resolve, reject) => {
    fn((err: any, result: unknown) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}
async function start() {
  const h2 = new SyncBailHook(['a', 'b']);
  h2.tap('A', (a, b) => [a, b]);
  h2.callAsync(1, 2, (e) => {
    console.log('a', e);
  });
  const a = await pify((cb: any) => h2.callAsync(1, 2, cb));
  console.log('---', a);
  // console.log(hook.callAsync.toString());
}

start()
  .then((r) => {
    console.log('r', r);
  })
  .catch((e) => {
    console.log('err', e);
  });
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
