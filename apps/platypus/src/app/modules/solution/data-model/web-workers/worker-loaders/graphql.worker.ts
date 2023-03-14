/**
 * This file is the actual web worker. It is compiled and loaded as standalone file.
 * The code that is loaded here is being executed in a background thread.
 * The actual implementation is in GraphQLWorker. Here we are just initializing the class.
 */
// eslint-disable-next-line
// @ts-expect-error
import { initialize } from 'monaco-editor/esm/vs/editor/editor.worker';
import type { worker as WorkerNamespace } from 'monaco-editor';
import { create } from '../FdmGraphQLDmlWorker';
import { IFdmGraphQLDmlWorkerOptions } from '../types';

// eslint-disable-next-line
declare const self: any;

self.onmessage = () => {
  initialize(
    (
      ctx: WorkerNamespace.IWorkerContext,
      options: IFdmGraphQLDmlWorkerOptions
    ) => {
      return create(ctx, options);
    }
  );
};
