import { Hook } from '.';

const hook = new Hook(['arg1', 'arg2', 'arg3']);

hook.tap('hook1', (arg1, arg2, arg3) => {
  console.log('1');
});
hook.intercept({
  // call: () => { console.log('call...') },
  tap: (tap) => {
    console.log('tap..', tap);
    // tap.fn = () => 0;
  },
});
hook.call(1, 2, 3);
hook.tap('hook1', (arg1, arg2, arg3) => {
  console.log('2');
});
hook.call();
// hook.tap('a', () => 0);
// hook.call(2);
