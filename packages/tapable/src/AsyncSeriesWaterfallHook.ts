/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable max-classes-per-file */
import { Hook } from './Hook';
import { HookCodeFactory } from './HookCodeFactory';
import { CompileOptions, TapType } from './interfaces/Hook';

class AsyncSeriesWaterfallHookCodeFactory extends HookCodeFactory {
  content(options: CompileOptions) {
    let code = `var count = ${options.taps.length};`;
    options.taps.forEach((tap, i) => {
      code += `
      var tap${i} = _taps[${i}];
      ${this.tapCall(options, i)}
      ${this.tapResult(options.type)}
      `;
    });
    code += 'count > 0 && _next0()';
    return code;
  }

  tapCall(options: CompileOptions, i: number) {
    const { args, type, taps } = options;
    const _interceptorsTaps = options.interceptors.map((_i) => _i.tap).filter(Boolean);
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
      return `
        function _next${i}(){
          ${_interceptorsTaps.map((_t, i) => `_interceptorsTaps[${i}](tap${i})`).join(';')}
          result = _x[${i}](${argCode});
          if (--count <= 0) {
            ${type === TapType.async ? `callback(result)` : `resolve(result)`};
            return;
          }else{
            _next${i + 1}();
          }
        }`;
    }
    if (taps[i].type === TapType.async) {
      return `
      function _next${i}(){
        ${_interceptorsTaps.map((_t, i) => `_interceptorsTaps[${i}](tap${i})`).join(';')}
        function _cb(res){
          result = res;
          if (--count <= 0) {
            ${type === TapType.async ? `callback(result)` : `resolve(result)`};
            return;
          }else{
            _next${i + 1}();
          }
        };
        _x[${i}](${argCode ? `${argCode}, _cb` : '_cb'});
      }`;
    }
    return `
    function _next${i}(){
      ${_interceptorsTaps.map((_t, i) => `_interceptorsTaps[${i}](tap${i})`).join(';')}
      _p = _x[${i}](${argCode ? `${argCode}, _cb` : '_cb'});
      if (!_p || !_p.then) {
        throw new Error('TapPromise回调未返回promsis');
      }
      _p.then((res) => {
        result = res;
        if (--count <= 0) {
          ${type === TapType.async ? `callback(result)` : `resolve(result)`};
          return;
        } else {
          _next${i + 1}();
        }
      })
    }`;
  }

  callbackResult() {
    return '';
  }

  promiseResult() {
    return '';
  }
}
const factory = new AsyncSeriesWaterfallHookCodeFactory();

/** 异步串行，参数上下传递 */
export class AsyncSeriesWaterfallHook extends Hook {
  compile(options: CompileOptions) {
    factory.setup(this, options);
    return factory.create(options);
  }

  _call() {
    throw new Error('AsyncSeriesWaterfallHook 不能使用call方法');
  }
}
