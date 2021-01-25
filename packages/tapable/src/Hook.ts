export interface ITap {
  /** 类型，不需要传 */
  type?: string;
  /** tap名称 */
  name: string;
  /** 回调 */
  fn?: (...args: string[]) => void;
  /** 再某些tap之前执行 */
  before?: string[] | string;
  /** 选择tap插入的优先级，越小越优先 */
  stage?: number;
}

export interface IInterceptor {
  /** call前钩子 */
  call: (...args: string[]) => void;
  /** 注册拦截，可修改tap */
  register: (tap: ITap) => ITap;
  /** 每个tap回调前的钩子 */
  tap: (tap: ITap) => void;
  /** 循环函数的钩子 */
  loop: (...args: string[]) => void;
}

export type TapType = 'sync' | 'async';

export class Hook {
  _args: string[];

  taps: ITap[];

  interceptors: IInterceptor[];

  constructor(args: string[] = []) {
    this.taps = [];
    this._args = args;
    this.interceptors = [];
  }

  tap = (options: ITap | string, fn: (...args: string[]) => void) => {
    this._tap('sync', options, fn);
  };

  _tap(type: TapType, options: string | ITap, fn: (...args: string[]) => void) {
    if (typeof options === 'string') {
      options = {
        name: options,
      };
    }
    if (!options.name || typeof options !== 'object') {
      throw new Error('options格式错误');
    }
    options = { type, fn, ...options };
    options = this._runRegister(options);
    this._insert(options);
  }

  _runRegister(options: ITap) {
    for (const interceptor of this.interceptors) {
      if (interceptor.register) {
        options = interceptor.register(options);
      }
    }
    return options;
  }

  _insert(options: ITap) {
    const stage = options.stage || 0;
    let before: Set<string> = new Set();
    if (typeof options.before === 'string') {
      before = new Set([options.before]);
    } else if (Array.isArray(options.before)) {
      before = new Set(options.before);
    }
    let i = this.taps.length;
    /** 插入排序，stage和before字段判断是否向前 */
    while (i > 0) {
      const tap = this.taps[i - 1];
      this.taps[i] = tap;
      const tState = tap.stage || 0;
      if (stage < tState) {
        i--;
        continue;
      }
      if (before.size) {
        before.delete(tap.name);
        i--;
        continue;
      }
      break;
    }
    this.taps[i] = options;
  }

  intercept(intercetor: IInterceptor) {
    this.interceptors.push({ ...intercetor });
    if (intercetor.register) {
      for (let i = 0; i < this.taps.length; i++) {
        this.taps[i] = intercetor.register(this.taps[i]);
      }
    }
  }
}
