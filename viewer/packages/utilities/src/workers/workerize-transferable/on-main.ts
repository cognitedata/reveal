/*!
 * Copyright 2022 Cognite AS
 */
import { MESSAGE_TYPE_RPC_TRANSFERABLE } from './message-types';

type Resolve = (value?: unknown) => void;
type Reject = (reason?: any) => void;

/** Options for worker method params */
export type WorkerMethodParamsOptions = {
  /** pick transferables from method params */
  pickTransferablesFromParams?: (params: any) => any[];
};

/**
 * Setup worker methods which receive transferables from worker method params. This function should be executed on the main thread.
 * @param worker worker instance
 * @param methods an object whose key is method name and whose value is options how to pick transferables from method params
 */
export function setupTransferableMethodsOnMain<WORKER extends Worker>(
  worker: WORKER,
  methods: {
    [x: string]: WorkerMethodParamsOptions;
  }
): void {
  let c = 0;
  const callbacks: {
    [x: number]: [Resolve, Reject];
  } = {};
  worker.addEventListener('message', e => {
    const d = e.data;
    if (d.type !== MESSAGE_TYPE_RPC_TRANSFERABLE) {
      return;
    }
    const f = callbacks[d.id];
    if (f) {
      delete callbacks[d.id];
      if (d.error) {
        f[1](Object.assign(Error(d.error.message), d.error));
      } else {
        f[0](d.result);
      }
    }
  });
  Object.keys(methods).forEach(method => {
    (worker as any)[method] = (...params: any[]) =>
      new Promise((a: Resolve, b: Reject) => {
        const id = ++c;
        callbacks[id] = [a, b];
        const opts = methods[method];
        worker.postMessage(
          { type: MESSAGE_TYPE_RPC_TRANSFERABLE, id, method, params },
          opts.pickTransferablesFromParams ? opts.pickTransferablesFromParams(params) : []
        );
      });
  });
}
