/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-implied-eval */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { AsyncSeriesHook } from '../src';

function pify(fn: (arg0: (err: any, result: any) => void) => void) {
  return new Promise((resolve, reject) => {
    fn((err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

describe('AsyncSeriesHook', () => {
  it('', async () => {
    const fn1 = jest.fn();
    const fn2 = jest.fn();
    const hook = new AsyncSeriesHook();
    let i = 0;
    hook.tapAsync('a', (cb) => {
      i++;
      setTimeout(() => {
        expect(i).toBe(1);
        fn1();
        cb();
      }, 100);
    });
    hook.tap('a', () => {
      i++;
      expect(i).toBe(2);
      fn2();
    });
    await new Promise((resolve) => {
      hook.callAsync(() => {
        resolve(1);
      });
    });
    expect(fn1).toBeCalledTimes(1);
    expect(fn2).toBeCalledTimes(1);
    i = 0;
    await hook.promise();
    expect(fn1).toBeCalledTimes(2);
    expect(fn2).toBeCalledTimes(2);
  });
});
