import { editor, Uri } from 'monaco-editor/esm/vs/editor/editor.api';

import { config } from '../config';
import { FdmGraphQLDmlWorker } from '../FdmGraphQLDmlWorker';
import { IFdmGraphQLDmlWorkerOptions } from '../types';

/**
 * Monaco Editor expects that the web workers are registered and managed in a specific way.
 * You must have the language registered and have the workers for the language registered.
 * Monaco Editor uses this class to manage the worker for that language.
 *
 */
export class WorkerManager {
  private worker: editor.MonacoWebWorker<FdmGraphQLDmlWorker> | null;
  private workerClientProxy: Promise<FdmGraphQLDmlWorker> | null;
  private _options: IFdmGraphQLDmlWorkerOptions;

  constructor(options: IFdmGraphQLDmlWorkerOptions) {
    this.worker = null;
    this.workerClientProxy = null;
    this._options = options;
  }

  private _stopWorker(): void {
    if (this.worker) {
      this.worker.dispose();
      this.worker = null;
    }
    this.workerClientProxy = null;
  }

  dispose(): void {
    this._stopWorker();
  }

  private getClientproxy(): Promise<FdmGraphQLDmlWorker> {
    if (!this.workerClientProxy) {
      this.worker = editor.createWebWorker<FdmGraphQLDmlWorker>({
        // module that exports the create() method and returns a `GraphQLWorker` instance
        moduleId: 'FdmGraphQLDmlWorker',
        label: config.languageId,
        // passed in to the create() method
        createData: {
          languageId: config.languageId,
          options: this._options.options,
        },
      });

      // eslint-disable-next-line
      this.workerClientProxy = <Promise<FdmGraphQLDmlWorker>>(
        // eslint-disable-next-line
        (<any>this.worker.getProxy())
      );
    }

    return this.workerClientProxy;
  }

  async getLanguageServiceWorker(
    ...resources: Uri[]
  ): Promise<FdmGraphQLDmlWorker> {
    const _client: FdmGraphQLDmlWorker = await this.getClientproxy();
    // eslint-disable-next-line
    await this.worker!.withSyncedResources(resources);
    return _client;
  }
}
