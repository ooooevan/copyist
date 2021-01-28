/* eslint-disable no-new-func */
/* eslint-disable @typescript-eslint/no-implied-eval */
import { Hook } from './Hook';
import { ArgsFunction, CompileOptions, TapType } from './interfaces/Hook';

export class HookCodeFactory {
  config: any;

  constructor(config?: any) {
    // this.config = config;
  }

  /** 创建执行函数 */
  create(options: CompileOptions) {
    let fn: ArgsFunction;
    switch (options.type) {
      case TapType.promise: {
        let code = this.header();
        const content = this.contentWithInterceptors(options);
        code += `
        return new Promise((resolve,reject) => {
          ${content}
          ${this.tapsResult()}
        })
        `;
        fn = new Function(this.args(options), code) as ArgsFunction;
        break;
      }
      case TapType.async: {
        let code = this.header();
        code += this.contentWithInterceptors(options);
        code += this.callbackResult(options.type);
        fn = new Function(this.args(options, 'callback'), code) as ArgsFunction;
        break;
      }
      case TapType.sync:
      default: {
        let code = this.header();
        code += this.contentWithInterceptors(options);
        code += this.callbackResult(options.type);
        fn = new Function(this.args(options), code) as ArgsFunction;
        break;
      }
    }
    return fn;
  }

  /** Hook存储fns */
  setup(instance: Hook, options: CompileOptions) {
    instance._x = options.taps.map((t) => t.fn) as ((...args: any[]) => void)[];
  }

  /** 头部，定义变量名 */
  header() {
    return `
      const _x = this._x;
      const _taps = this.taps;
      const _interceptors = this.interceptors;
      const _interceptorsTaps = _interceptors.map(_tap=>_tap.tap).filter(Boolean);
    `;
  }

  args(options: CompileOptions, cb?: string) {
    return options.args.concat(cb).join(',');
  }

  /** interceptor中的call函数 */
  callHook(options: CompileOptions) {
    let idx = 0;
    let code = '';
    options.interceptors.forEach((interceptor) => {
      if (interceptor.call) {
        code += `_interceptors[${idx}].call(${options.args.join(',')});`;
        idx++;
      }
    });
    return code;
  }

  /** 执行的函数以及拦截器函数 */
  contentWithInterceptors(options: CompileOptions) {
    const _interceptorsTaps = options.interceptors.map((_i) => _i.tap).filter(Boolean);
    return `
      ${this.callHook(options)}
      let result;
      for(let i=0;i<_taps.length;i++){
        const tap = _taps[i];
        ${_interceptorsTaps.map((_t, i) => `_interceptorsTaps[${i}](tap)`).join(';')}
        result = _x[i](${this.args(options)});
        ${this.tapResult(options.type)}
      }
    `;
  }

  /** 执行tap的结果处理逻辑 */
  tapResult(type?: TapType) {
    return '';
  }

  /** 执行完taps返回 */
  tapsResult(type?: TapType) {
    return 'resolve()';
  }

  /** 执行完taps回调 */
  callbackResult(type?: TapType): string {
    if (type === TapType.sync) {
      return '';
    }
    return 'callback()';
  }
}
