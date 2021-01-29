/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable max-classes-per-file */
import { Hook } from './Hook';
import { HookCodeFactory } from './HookCodeFactory';
import { CompileOptions, TapType } from './interfaces/Hook';

class SyncWaterfallHookCodeFactory extends HookCodeFactory {
  // tapBefore(options: CompileOptions) {
  //   return `let args = [${this.args(options)}];
  //     let result=args;`;
  // }
  tapsResult(options?: CompileOptions) {
    return 'resolve(result)';
  }

  tapCall(options: CompileOptions, i: number) {
    const { args } = options;
    let code = '';
    args.forEach((arg, idx) => {
      if (idx === 0) {
        code += `result || ${options.args[0]},`;
      } else {
        code += arg;
      }
    });
    return ` result = _x[${i}](${code}) || result;`;
  }

  callbackResult(type?: TapType) {
    if (type === TapType.sync) {
      return 'return result;';
    }
    return 'callback(null, result);';
  }
}
const factory = new SyncWaterfallHookCodeFactory();

/** 同步串行，上一个执行结果交给下一个作为参数 */
export class SyncWaterfallHook extends Hook {
  compile(options: CompileOptions) {
    factory.setup(this, options);
    return factory.create(options);
  }

  tapAsync = () => {
    throw new Error('SyncBailHook 不支持 tapAsync');
  };

  tapPromise = () => {
    throw new Error('SyncBailHook 不支持 tapPromise');
  };
}
