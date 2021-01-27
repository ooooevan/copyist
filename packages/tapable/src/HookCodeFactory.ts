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
          resolve();
        })
        `;
        fn = new Function(this.args(options), code) as ArgsFunction;
        break;
      }
      case TapType.async: {
        let code = this.header();
        code += this.contentWithInterceptors(options);
        code += '_callback()';
        fn = new Function(this.args(options, '_callback'), code) as ArgsFunction;
        break;
      }
      case TapType.sync:
      default: {
        let code = this.header();
        fn = new Function(
          this.args(options),
          (code += this.contentWithInterceptors(options)),
        ) as ArgsFunction;
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
      for(let i=0;i<_taps.length;i++){
        const tap = _taps[i];
        ${_interceptorsTaps.map((_t, i) => `_interceptorsTaps[${i}](tap)`).join(';')}
        _x[i](${this.args(options)});
      }
    `;
  }
}
