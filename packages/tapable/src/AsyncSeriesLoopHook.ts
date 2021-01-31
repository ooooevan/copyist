/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable max-classes-per-file */
import { Hook } from './Hook';
import { HookCodeFactory } from './HookCodeFactory';
import { CompileOptions, TapType } from './interfaces/Hook';

class AsyncSeriesLoopHookCodeFactory extends HookCodeFactory {
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
          var result${i} = _x[${i}](${argCode});
          if (result${i} !== undefined) {
            _next0();
          }else if (typeof _next${i + 1} !== 'undefined'){
            _next${i + 1}();
          }else{
            ${type === TapType.async ? `callback(result${i})` : `resolve(result${i})`};
          }
        }`;
    }
    if (taps[i].type === TapType.async) {
      return `
      function _next${i}(){
        ${_interceptorsTaps.map((_t, i) => `_interceptorsTaps[${i}](tap${i})`).join(';')}
        function _cb(res){
          if (res !== undefined) {
            _next0();
          }else if (typeof _next${i + 1} !== 'undefined'){
            _next${i + 1}();
          }else{
            ${type === TapType.async ? `callback(res)` : `resolve(res)`};
          }
        };
        _x[${i}](${argCode ? `${argCode}, _cb` : '_cb'});
      }`;
    }
    return `
    function _next${i}(){
      ${_interceptorsTaps.map((_t, i) => `_interceptorsTaps[${i}](tap${i})`).join(';')}
      function _cb(res){
        if (res !== undefined) {
          _next0();
        }else if (typeof _next${i + 1} !== 'undefined'){
          _next${i + 1}();
        }else{
          ${type === TapType.async ? `callback(res)` : `resolve(res)`};
        }
      };
      _p = _x[${i}](${argCode ? `${argCode}, _cb` : '_cb'});
      if (!_p || !_p.then) {
        throw new Error('TapPromise回调未返回promsis');
      }
      _p.then((res) => {
        if (res !== undefined) {
          _next0();
        }else if (typeof _next${i + 1} !== 'undefined'){
          _next${i + 1}();
        }else{
          ${type === TapType.async ? `callback(res)` : `resolve(res)`};
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
const factory = new AsyncSeriesLoopHookCodeFactory();

/** 异步循环，返回值不是undefined继续循环 */
export class AsyncSeriesLoopHook extends Hook {
  compile(options: CompileOptions) {
    factory.setup(this, options);
    return factory.create(options);
  }

  _call() {
    throw new Error('AsyncSeriesLoopHook 不能使用call方法');
  }
}
