import { Hook } from '.';

const fn = () => 0;
const hook = new Hook(['arg1']);
hook.tap('a', (a) => {
  console.log('tap', a);
});

hook.intercept({
  call: () => {
    console.log('call...');
  },
});
hook.call(1);

hook.tap('b', (a) => {
  console.log('tap', a);
});
hook.call(2);

// function anonymous(arg1,arg2,arg3
//   ) {

//       var _taps = this.taps;
//       var _fns = this.taps.map(tap => tap.fn);
//       var _ics = this.interceptors;

//         const _tapCbs = _ics.map(_tap=>_tap.tap).filter(Boolean);
//         _taps.forEach((tap, tIdx) => {
//           if (tap.fn) {
//             _tapCbs[0](tap)
//             _fns[tIdx](arg1,arg2,arg3);
//           }
//         });

//   }
