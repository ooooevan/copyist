/* eslint-disable @typescript-eslint/restrict-template-expressions */
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
          ${this.tapsResult(options)}
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
    return options.args.concat(cb || []).join(',');
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
    return `
      ${this.callHook(options)}
      ${this.tapsBefore(options)}
      ${this.content(options)}
    `;
  }

  /** taps执行 */
  content(options: CompileOptions) {
    const _interceptorsTaps = options.interceptors.map((_i) => _i.tap).filter(Boolean);
    return options.taps.length > 0
      ? `for(let i=0;i<_taps.length;i++){
        const tap = _taps[i];
        ${_interceptorsTaps.map((_t, i) => `_interceptorsTaps[${i}](tap)`).join(';')}
        ${this.tapCall(options)}
        ${this.tapResult(options.type)}
      }`
      : '';
  }

  /** loop执行 */
  contentLooping(options: CompileOptions) {
    const _interceptorsTaps = options.interceptors.map((_i) => _i.tap).filter(Boolean);
    let tapsCode = '';
    options.taps.forEach((tap, i) => {
      tapsCode += `
        var tap = _taps[${i}];
        ${_interceptorsTaps.map((_t, i) => `_interceptorsTaps[${i}](tap)`).join(';')}
        ${this.tapCall(options, i)}
        if(result !== undefined){
          loop = true;
          continue;
        };
        loop = false;
        ${this.tapResult(options.type)}
        `;
    });
    const code = `
    let loop = false;
    do{
      ${tapsCode}
    }while(loop)`;
    return code;
  }

  /** tap执行前执行 */
  tapsBefore(options: CompileOptions) {
    return `let args = ${options.args[0]}
    let result = args;`;
  }

  /** tap执行函数 */
  tapCall(options: CompileOptions, i?: number) {
    const { args } = options;
    let code = '';
    args.forEach((arg, idx) => {
      if (idx === 0) {
        code += `result || ${options.args[0]},`;
      } else {
        code += `${arg},`;
      }
    });
    code = code.slice(0, -1);
    return ` result = _x[${typeof i === 'number' ? i : 'i'}](${code});`;
  }

  /** 执行tap的结果处理逻辑 */
  tapResult(type?: TapType) {
    return '';
  }

  /** 执行完taps返回 */
  tapsResult(options?: CompileOptions) {
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
