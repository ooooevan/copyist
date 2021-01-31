/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { AsyncSeriesLoopHook } from '../src';

describe('AsyncSeriesLoopHook', () => {
  it('能正常退出', async () => {
    const hook = new AsyncSeriesLoopHook();
    const fn = jest.fn();
    let idx = 0;
    hook.tapAsync('a', (cb) => {
      fn();
      if (idx < 100) {
        idx++;
        cb(true);
      }
      cb();
    });
    await hook.promise();
    expect(fn).toBeCalledTimes(101);
    expect(idx).toBe(100);
  });
  it('多个tap依次执行，遇到非undefined直接继续循环', async () => {
    const h1 = new AsyncSeriesLoopHook();
    const fn1 = jest.fn();
    const fn2 = jest.fn();
    let idx = 0;
    h1.tap('a', fn1);
    h1.tapPromise('a', () => {
      fn2();
      return new Promise<boolean | void>((r) => {
        if (idx < 100) {
          idx++;
          r(true);
        }
        r();
      });
    });
    await h1.promise();
    expect(fn1).toBeCalledTimes(101);
    expect(fn2).toBeCalledTimes(101);
    expect(idx).toBe(100);
  });
});
