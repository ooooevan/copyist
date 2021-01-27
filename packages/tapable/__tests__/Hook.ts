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
