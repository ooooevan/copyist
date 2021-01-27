import { SyncHook } from '../src';

describe('注册tap', () => {
  it('有1个tap', () => {
    const hook = new SyncHook();
    hook.tap('a', () => 0);
    expect(hook.taps.length).toBe(1);
  });

  it('有2个tap', () => {
    const hook = new SyncHook();
    hook.tap('a', () => 0);
    hook.tap('a', () => 0);
    expect(hook.taps.length).toBe(2);
  });

  it('按stage优先级排序', () => {
    const hook = new SyncHook();
    hook.tap(
      {
        name: 'a1',
      },
      () => 0,
    );
    hook.tap(
      {
        name: 'a2',
        stage: -1,
      },
      () => 0,
    );
    hook.tap(
      {
        name: 'a3',
        stage: 1,
      },
      () => 0,
    );
    const names = hook.taps.map((tap) => tap.name);
    expect(names).toEqual(['a2', 'a1', 'a3']);
  });

  it('按before优先级排序', () => {
    const hook = new SyncHook();
    hook.tap('a', () => 0);
    hook.tap('b', () => 0);
    hook.tap(
      {
        name: 'c',
        before: 'a',
      },
      () => 0,
    );
    let names = hook.taps.map((tap) => tap.name);
    expect(names).toEqual(['c', 'a', 'b']);
    hook.tap(
      {
        name: 'd',
        before: ['a'],
      },
      () => 0,
    );
    names = hook.taps.map((tap) => tap.name);
    expect(names).toEqual(['c', 'd', 'a', 'b']);
    hook.tap(
      {
        name: 'e',
        before: ['a', 'd'],
      },
      () => 0,
    );
    names = hook.taps.map((tap) => tap.name);
    expect(names).toEqual(['c', 'e', 'd', 'a', 'b']);
  });
});

describe('call执行tap', () => {
  it('call执行tap', () => {
    const fn = jest.fn();
    let value = '';
    const hook = new SyncHook(['a']);
    hook.tap('tap1', (val) => {
      value = val;
    });
    hook.tap('tap2', fn);
    hook.call('hahhaha');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(value).toBe('hahhaha');
  });
});

describe('拦截器-register', () => {
  const fn1 = jest.fn();
  const fn2 = jest.fn();
  const fn3 = jest.fn();
  it('拦截器修改tap', () => {
    const hook = new SyncHook();
    hook.tap('a', fn1);
    let fns = hook.taps.map((tap) => tap.fn);
    expect(fns[0]).toBe(fn1);

    hook.intercept({
      register: (tap) => {
        tap.fn = fn2;
        return tap;
      },
    });
    fns = hook.taps.map((tap) => tap.fn);
    expect(fns[0]).toBe(fn2);

    hook.tap('a', fn3);
    fns = hook.taps.map((tap) => tap.fn);
    expect(fns[1]).toBe(fn2);
  });
});

describe('拦截器-call', () => {
  const fn1 = jest.fn();
  const fn2 = jest.fn();
  const fn3 = jest.fn();
  it('调用拦截器-call', () => {
    const hook = new SyncHook(['arg1']);
    hook.tap('a', fn1);
    const fns = hook.taps.map((tap) => tap.fn);
    expect(fns[0]).toBe(fn1);

    hook.intercept({
      call: fn2,
    });
    hook.call(1);
    expect(fn2).toBeCalledWith(1);

    hook.tap('a', fn3);
    hook.call(2);
    expect(fn2).toBeCalledWith(2);
  });
});
describe('拦截器-tap', () => {
  it('调用拦截器-tap', () => {
    const fn1 = jest.fn();
    const fn2 = jest.fn();
    const fn3 = jest.fn();
    const hook = new SyncHook(['arg1']);
    hook.tap('a', fn1);
    hook.intercept({
      tap: fn2,
    });
    hook.call();
    expect(fn2).toBeCalledTimes(1);

    hook.tap('a', fn3);
    hook.call();
    expect(fn2).toBeCalledTimes(3);
  });
  it('调用拦截器-tap,连续call结果一致', () => {
    const fn = jest.fn();
    const hook = new SyncHook(['arg1']);
    hook.tap('a', fn);
    hook.intercept({
      tap: (tap) => {
        tap.fn = () => 0;
      },
    });
    hook.call();
    hook.call();
    expect(fn).toBeCalledTimes(2);
  });
  it('调用拦截器-tap,tap可修改fn', () => {
    const fn = jest.fn();
    const hook = new SyncHook(['arg1']);
    hook.tap('a', fn);
    hook.intercept({
      tap: (tap) => {
        tap.fn = () => 0;
      },
    });
    hook.call();
    hook.call();
    expect(fn).toBeCalledTimes(2);
    hook.tap('a', () => 0);
    hook.call();
    expect(fn).toBeCalledTimes(2);
  });
});

describe('call_promise', () => {
  it('promise', async () => {
    const fn = jest.fn();
    const fn1 = jest.fn();
    const hook = new SyncHook(['arg1']);
    hook.tap('a', fn);
    await hook.promise().then(fn1);
    expect(fn).toBeCalledTimes(1);
    expect(fn1).toBeCalledTimes(1);
  });
});

describe('call_async', () => {
  it('async', () => {
    const fn = jest.fn();
    const fn1 = jest.fn();
    const hook = new SyncHook(['arg1']);
    hook.tap('a', fn);
    hook.callAsync('', fn1);
    expect(fn).toBeCalledTimes(1);
    expect(fn1).toBeCalledTimes(1);
  });
});

describe('SyncHook', () => {
  it('should allow to create sync hooks', async () => {
    const h0 = new SyncHook();
    const h1 = new SyncHook(['test']);
    const h2 = new SyncHook(['test', 'arg2']);
    const h3 = new SyncHook(['test', 'arg2', 'arg3']);

    h0.call();
    await h0.promise();
    await new Promise((resolve) => h0.callAsync(resolve));

    const mock0 = jest.fn();
    h0.tap('A', mock0);

    h0.call();

    expect(mock0).toHaveBeenLastCalledWith();

    const mock1 = jest.fn();
    h0.tap('B', mock1);

    h0.call();

    expect(mock1).toHaveBeenLastCalledWith();

    const mock2 = jest.fn();
    const mock3 = jest.fn();
    const mock4 = jest.fn();
    const mock5 = jest.fn();

    h1.tap('C', mock2);
    h2.tap('D', mock3);
    h3.tap('E', mock4);
    h3.tap('F', mock5);

    h1.call('1');
    h2.call('1', 2);
    h3.call('1', 2, 3);

    expect(mock2).toHaveBeenLastCalledWith('1');
    expect(mock3).toHaveBeenLastCalledWith('1', 2);
    expect(mock4).toHaveBeenLastCalledWith('1', 2, 3);
    expect(mock5).toHaveBeenLastCalledWith('1', 2, 3);

    await new Promise((resolve) => h1.callAsync('a', resolve));
    await h2.promise('a', 'b');
    await new Promise((resolve) => h3.callAsync('a', 'b', 'c', resolve));

    expect(mock2).toHaveBeenLastCalledWith('a');
    expect(mock3).toHaveBeenLastCalledWith('a', 'b');
    expect(mock4).toHaveBeenLastCalledWith('a', 'b', 'c');
    expect(mock5).toHaveBeenLastCalledWith('a', 'b', 'c');

    await h3.promise('x', 'y');

    expect(mock4).toHaveBeenLastCalledWith('x', 'y', undefined);
    expect(mock5).toHaveBeenLastCalledWith('x', 'y', undefined);
  });

  it('should sync execute hooks', () => {
    const h1 = new SyncHook(['a']);
    const mockCall1 = jest.fn();
    const mockCall2 = jest.fn(() => 'B');
    const mockCall3 = jest.fn(() => 'C');
    h1.tap('A', mockCall1);
    h1.tap('B', mockCall2);
    h1.tap('C', mockCall3);
    expect(h1.call()).toEqual(undefined);
    expect(mockCall1).toHaveBeenCalledTimes(1);
    expect(mockCall2).toHaveBeenCalledTimes(1);
    expect(mockCall3).toHaveBeenCalledTimes(1);
  });

  it('should allow to intercept calls', () => {
    const hook = new SyncHook(['arg1', 'arg2']);

    const mockCall = jest.fn();
    const mock0 = jest.fn();
    const mockRegister = jest.fn((x) => ({
      name: 'huh',
      type: 'sync',
      fn: mock0,
    }));

    const mock1 = jest.fn();
    hook.tap('Test1', mock1);

    hook.intercept({
      call: mockCall,
      register: mockRegister,
    });

    const mock2 = jest.fn();
    hook.tap('Test2', mock2);

    hook.call(1, 2);

    expect(mockCall).toHaveBeenLastCalledWith(1, 2);
    expect(mockRegister).toHaveBeenLastCalledWith({
      type: 'sync',
      name: 'Test2',
      fn: mock2,
    });
    expect(mock1).not.toHaveBeenLastCalledWith(1, 2);
    expect(mock2).not.toHaveBeenLastCalledWith(1, 2);
    expect(mock0).toHaveBeenLastCalledWith(1, 2);
  });

  it('should throw error on tapAsync', () => {
    const hook = new SyncHook(['arg1', 'arg2']);
    expect(() => hook.tapAsync()).toThrow(/tapAsync/);
  });

  it('should throw error on tapPromise', () => {
    const hook = new SyncHook(['arg1', 'arg2']);
    expect(() => hook.tapPromise()).toThrow(/tapPromise/);
  });
});
