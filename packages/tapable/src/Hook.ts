export interface Tap {
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

export interface Interceptor {
  /** call前钩子 */
  call: (...args: string[]) => void;
  /** 注册拦截，可修改tap */
  register: (tap: Tap) => Tap;
  /** 每个tap回调前的钩子 */
  tap: (tap: Tap) => void;
  /** 循环函数的钩子 */
  loop: (...args: string[]) => void;
}

enum TapType {
  sync = 'sync',
  async = 'async',
}

export class Hook {
  _args: string[];

  taps: Tap[];

  interceptors: Interceptor[];

  constructor(args: string[] = []) {
    this.taps = [];
    this._args = args;
    this.interceptors = [];
  }

  tap = (options: Tap | string, fn: (...args: string[]) => void) => {
    this._tap(TapType.sync, options, fn);
  };

  _tap(type: TapType, options: string | Tap, fn: (...args: string[]) => void) {
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

  _runRegister(options: Tap) {
    for (const interceptor of this.interceptors) {
      if (interceptor.register) {
        options = interceptor.register(options);
      }
    }
    return options;
  }

  _insert(options: Tap) {
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

  intercept(intercetor: Interceptor) {
    this.interceptors.push({ ...intercetor });
    if (intercetor.register) {
      for (let i = 0; i < this.taps.length; i++) {
        this.taps[i] = intercetor.register(this.taps[i]);
      }
    }
  }
}
