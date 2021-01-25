import { Hook } from '../src';

describe('注册tap', () => {
  it('有1个tap', () => {
    const hook = new Hook();
    hook.tap('a', () => 0);
    expect(hook.taps.length).toBe(1);
  });

  it('有2个tap', () => {
    const hook = new Hook();
    hook.tap('a', () => 0);
    hook.tap('a', () => 0);
    expect(hook.taps.length).toBe(2);
  });

  it('按stage优先级排序', () => {
    const hook = new Hook();
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
    const hook = new Hook();
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
