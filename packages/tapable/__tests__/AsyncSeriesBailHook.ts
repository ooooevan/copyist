/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-implied-eval */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { AsyncSeriesBailHook } from '../src';

describe('AsyncSeriesBailHook', () => {
  it('tap', async () => {
    const fn1 = jest.fn();
    const fn2 = jest.fn();
    const hook = new AsyncSeriesBailHook();
    hook.tap('a', () => {
      fn1();
      return true;
    });
    hook.tapAsync('a', (cb) => {
      fn2();
      setTimeout(cb, 100);
    });
    await new Promise<void>((resolve) => {
      hook.callAsync(() => {
        resolve();
      });
    });
    expect(fn1).toBeCalledTimes(1);
    expect(fn2).toBeCalledTimes(0);

    await hook.promise();
    expect(fn1).toBeCalledTimes(2);
    expect(fn2).toBeCalledTimes(0);
  });
  it('tapAsync', async () => {
    const fn1 = jest.fn();
    const fn2 = jest.fn();
    const hook = new AsyncSeriesBailHook();
    hook.tapAsync('a', (cb) => {
      fn1();
      cb(true);
    });
    hook.tapAsync('a', (cb) => {
      fn2();
      setTimeout(cb, 100);
    });
    await new Promise<void>((resolve) => {
      hook.callAsync(() => {
        resolve();
      });
    });
    expect(fn1).toBeCalledTimes(1);
    expect(fn2).toBeCalledTimes(0);

    await hook.promise();
    expect(fn1).toBeCalledTimes(2);
    expect(fn2).toBeCalledTimes(0);
  });
});
