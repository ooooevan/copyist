/* eslint-disable max-classes-per-file */
import { Hook } from './Hook';
import { HookCodeFactory } from './HookCodeFactory';
import { CompileOptions } from './interfaces/Hook';

class SyncLoopHookCodeFactory extends HookCodeFactory {
  constructor() {
    super();
    this.content = this.contentLooping;
  }
}
const factory = new SyncLoopHookCodeFactory();

export class SyncLoopHook extends Hook {
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
