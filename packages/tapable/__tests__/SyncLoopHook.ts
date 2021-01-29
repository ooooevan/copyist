import { SyncLoopHook } from '../src';

describe('SyncLoopHook', () => {
  it('能正常退出', () => {
    const hook = new SyncLoopHook();
    const fn = jest.fn();
    let idx = 0;
    hook.tap('a', () => {
      fn();
      if (idx < 100) {
        idx++;
        return true;
      }
      return undefined;
    });
    hook.call();
    expect(fn).toBeCalledTimes(101);
    expect(idx).toBe(100);
  });
  it('多个tap依次执行，遇到非undefined直接继续循环', () => {
    const h1 = new SyncLoopHook();
    const fn1 = jest.fn();
    const fn2 = jest.fn();
    let idx = 0;
    h1.tap('a', fn1);
    h1.tap('a', () => {
      fn2();
      if (idx < 100) {
        idx++;
        return true;
      }
      return undefined;
    });
    h1.call();
    expect(fn1).toBeCalledTimes(101);
    expect(fn2).toBeCalledTimes(101);
    expect(idx).toBe(100);

    const h2 = new SyncLoopHook();
    const fn3 = jest.fn();
    const fn4 = jest.fn();
    let idx1 = 0;
    h2.tap('a', () => {
      fn3();
      if (idx1 < 100) {
        idx1++;
        return true;
      }
      return undefined;
    });
    h2.tap('a', fn4);
    h2.call();
    expect(fn3).toBeCalledTimes(101);
    expect(fn4).toBeCalledTimes(1);
    expect(idx1).toBe(100);
  });
});
