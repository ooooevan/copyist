/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-implied-eval */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { AsyncParallelHook } from '../src';

function pify(fn: (arg0: (err: any, result: any) => void) => void) {
  return new Promise((resolve, reject) => {
    fn((err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

describe('AsyncParallelHook', () => {
  it('触发回调', async () => {
    const fn1 = jest.fn();
    const fn2 = jest.fn();
    const hook = new AsyncParallelHook();
    hook.tap('a', fn1);
    hook.tapAsync('a', (cb) => {
      setTimeout(cb, 100);
    });
    await new Promise<void>((resolve) => {
      hook.callAsync(() => {
        fn2();
        resolve();
      });
    });
    expect(fn1).toBeCalledTimes(1);
    expect(fn2).toBeCalledTimes(1);

    await hook.promise();
    expect(fn1).toBeCalledTimes(2);
    expect(fn2).toBeCalledTimes(1);
  });
});
