import { Hook } from './Hook';
import { HookCodeFactory } from './HookCodeFactory';
import { CompileOptions } from './interfaces/Hook';

const factory = new HookCodeFactory();

export class SyncHook extends Hook {
  compile(options: CompileOptions) {
    factory.setup(this, options);
    return factory.create(options);
  }
}
