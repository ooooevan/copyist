/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable max-classes-per-file */
import { Hook } from './Hook';
import { HookCodeFactory } from './HookCodeFactory';
import { CompileOptions, TapType } from './interfaces/Hook';

class AsyncParallelHookCodeFactory extends HookCodeFactory {
  content(options: CompileOptions) {
    const _interceptorsTaps = options.interceptors.map((_i) => _i.tap).filter(Boolean);
    let code = `var count = ${options.taps.length};`;
    options.taps.forEach((tap, i) => {
      code += `
      var tap${i} = _taps[${i}];
      ${_interceptorsTaps.map((_t, i) => `_interceptorsTaps[${i}](tap${i})`).join(';')}
      ${this.tapCall(options, i)}
      ${this.tapResult(options.type)}
      `;
    });
    return code;
  }

  tapCall(options: CompileOptions, i: number) {
    const { args, type, taps } = options;
    let argCode = '';
    args.forEach((arg, idx) => {
      if (idx === 0) {
        argCode += `result || ${options.args[0]},`;
      } else {
        argCode += `${arg},`;
      }
    });
    argCode = argCode.slice(0, -1);
    if (taps[i].type === TapType.sync) {
      return `result = _x[${i}](${argCode});
            if (--count <= 0) ${type === TapType.async ? `callback()` : `resolve()`};
          `;
    }
    if (taps[i].type === TapType.async) {
      return `
            function _cb(){
              if (--count <= 0) ${type === TapType.async ? `callback()` : `resolve()`};
            };
            result = _x[${i}](${argCode ? `${argCode}, _cb` : '_cb'});
          `;
    }
    return `
          _p = _x[${i}](${argCode ? `${argCode}, _cb` : '_cb'});
          if (!_p || !_p.then) {
            throw new Error('TapPromise回调未返回promsis');
          }
          _p.then(() => {
            if (--count <= 0) ${type === TapType.async ? `callback()` : `resolve()`};
          })
        `;
  }

  callbackResult() {
    return '';
  }

  promiseResult() {
    return '';
  }
}
const factory = new AsyncParallelHookCodeFactory();

/** 异步并发，不关心函数返回值 */
export class AsyncParallelHook extends Hook {
  compile(options: CompileOptions) {
    factory.setup(this, options);
    return factory.create(options);
  }

  _call() {
    throw new Error('AsyncParallelHook 不能使用call方法');
  }
}
