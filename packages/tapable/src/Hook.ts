/* eslint-disable @typescript-eslint/no-unsafe-return */

import {
  ArgsFunction,
  ArgsPromiseFunction,
  ArgsVoidFunction,
  CompileOptions,
  Interceptor,
  Tap,
  TapType,
} from './interfaces/Hook';

export class Hook {
  _args: string[];

  taps: Tap[];

  interceptors: Interceptor[];

  _x: ((...args: string[]) => void)[] = [];

  call: ArgsFunction;

  callAsync: ArgsVoidFunction;

  promise: ArgsPromiseFunction;

  constructor(args: string[] = []) {
    this.taps = [];
    this._args = args;
    this.interceptors = [];
    this.call = this._call;
    this.callAsync = this._callAsync;
    this.promise = this._promise;
  }

  tap = (options: Tap | string, fn: (...args: string[]) => void) => {
    this._tap(TapType.sync, options, fn);
  };

  tapAsync = (options: Tap | string, fn: (...args: string[]) => void) => {
    this._tap(TapType.async, options, fn);
  };

  tapPromise = (options: Tap | string, fn: (...args: string[]) => void) => {
    this._tap(TapType.promise, options, fn);
  };

  _tap(type: TapType, options: string | Tap, fn: (...args: string[]) => void) {
    if (typeof options === 'string') {
      options = {
        name: options,
      };
    }
    if (!options.name || typeof options !== 'object') {
      throw new Error('参数错误');
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
    this._reset();
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

  _call(...args: any[]) {
    this.call = this._createCall(TapType.sync);
    return this.call(...args);
  }

  _callAsync(...args: any[]) {
    this.callAsync = this._createCall(TapType.async);
    return this.callAsync(...args);
  }

  _promise(...args: any[]) {
    this.promise = this._createCall(TapType.promise);
    return this.promise(...args);
  }

  _reset() {
    this.call = this._call;
  }

  compile(options: CompileOptions): ArgsFunction {
    throw new Error('Method not implemented.');
  }

  /** 创建call函数 */
  _createCall(type: TapType) {
    return this.compile({
      taps: this.taps,
      interceptors: this.interceptors,
      args: this._args,
      type,
    });
  }
}
