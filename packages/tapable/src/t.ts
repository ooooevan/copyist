/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-implied-eval */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  SyncBailHook,
  SyncLoopHook,
  AsyncParallelBailHook,
  AsyncParallelHook,
  SyncHook,
  SyncWaterfallHook,
  AsyncSeriesHook,
  AsyncSeriesBailHook,
  AsyncSeriesWaterfallHook,
  AsyncSeriesLoopHook,
} from '.';

async function start() {
  const h1 = new AsyncSeriesLoopHook();

  let idx = 0;
  // h1.tap('a', () => {
  //   console.log('11');
  // });
  h1.tapPromise(
    'a',
    () =>
      new Promise<boolean | void>((r) => {
        if (idx < 100) {
          idx++;
          console.log(idx);
          r(true);
        }
        r();
      }),
  );
  await h1.promise();
}

start();
