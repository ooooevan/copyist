/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { SyncBailHook } from '../src';

function pify(fn: Function) {
  return new Promise((resolve, reject) => {
    fn((err: any, result: unknown) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

describe('SyncBailHook', () => {
  it('返回非undefined，停止后续执行', () => {
    const fn1 = jest.fn();
    const fn2 = jest.fn();
    const hook = new SyncBailHook();
    hook.tap('1', fn1);
    hook.tap('1', () => 0);
    hook.tap('1', fn2);
    hook.call();
    expect(fn1).toBeCalled();
    expect(fn2).not.toBeCalled();
  });
  it('should allow to create sync bail hooks', async () => {
    const h1 = new SyncBailHook(['a']);
    const h2 = new SyncBailHook(['a', 'b']);

    const r = h1.call(1);
    expect(r).toEqual(undefined);

    h1.tap('A', () => undefined);
    h2.tap('A', (a, b) => [a, b]);

    expect(h1.call(1)).toEqual(undefined);
    expect(await h1.promise(1)).toEqual(undefined);
    expect(await pify((cb: any) => h1.callAsync(1, cb))).toEqual(undefined);
    expect(h2.call(1, 2)).toEqual([1, 2]);
    expect(await h2.promise(1, 2)).toEqual([1, 2]);
    expect(await pify((cb: any) => h2.callAsync(1, 2, cb))).toEqual([1, 2]);

    h1.tap('B', (a) => `ok${a}`);
    h2.tap('B', () => 'wrong');

    expect(h1.call(10)).toEqual('ok10');
    expect(await h1.promise(10)).toEqual('ok10');
    expect(await pify((cb: any) => h1.callAsync(10, cb))).toEqual('ok10');
    expect(h2.call(10, 20)).toEqual([10, 20]);
    expect(await h2.promise(10, 20)).toEqual([10, 20]);
    expect(await pify((cb: any) => h2.callAsync(10, 20, cb))).toEqual([10, 20]);
  });

  it('should bail on non-null return', () => {
    const h1 = new SyncBailHook(['a']);
    const mockCall1 = jest.fn();
    const mockCall2 = jest.fn(() => 'B');
    const mockCall3 = jest.fn(() => 'C');
    h1.tap('A', mockCall1);
    h1.tap('B', mockCall2);
    h1.tap('C', mockCall3);
    expect(h1.call()).toEqual('B');
    expect(mockCall1).toHaveBeenCalledTimes(1);
    expect(mockCall2).toHaveBeenCalledTimes(1);
    expect(mockCall3).toHaveBeenCalledTimes(0);
  });

  it('should allow to intercept calls', () => {
    const hook = new SyncBailHook(['x']);

    const mockCall = jest.fn();
    const mockTap = jest.fn((x) => x);

    hook.intercept({
      call: mockCall,
      tap: mockTap,
    });

    hook.call(5);

    expect(mockCall).toHaveBeenLastCalledWith(5);
    expect(mockTap).not.toHaveBeenCalled();

    hook.tap('test', () => 10);

    hook.call(7);

    expect(mockCall).toHaveBeenLastCalledWith(7);
    expect(mockTap).toHaveBeenCalled();
  });

  it('should throw on tapAsync', () => {
    const hook = new SyncBailHook(['x']);
    expect(() => hook.tapAsync()).toThrow(/tapAsync/);
  });

  it('should throw on tapPromise', () => {
    const hook = new SyncBailHook(['x']);
    expect(() => hook.tapPromise()).toThrow(/tapPromise/);
  });

  it('should not crash with many plugins', () => {
    const hook = new SyncBailHook(['x']);
    for (let i = 0; i < 1000; i++) {
      hook.tap('Test', () => 42);
    }
    expect(hook.call()).toBe(42);
  });
});
