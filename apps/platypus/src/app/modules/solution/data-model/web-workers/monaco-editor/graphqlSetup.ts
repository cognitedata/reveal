import { BuiltInType } from '@platypus/platypus-core';
import { Monaco } from '@monaco-editor/react';
import { IDisposable, Uri } from 'monaco-editor';
import { config } from '../config';
import { EditorInstance, WorkerAccessor } from '../types';
import { WorkerManager } from './workerManager';
import { FdmGraphQLDmlWorker } from '../FdmGraphQLDmlWorker';
import { DiagnosticsAdapter } from './language-features';
import { DocumentFormattingAdapter } from './language-features/DocumentFormattingAdapter';
import { CodeCompletionProvider } from './language-features/CodeCompletionProvider';

/**
 * File that is used to setup or wire up web worker and all monaco stuff
 */
export const setupGraphql = (
  monaco: Monaco,
  builtInTypes: BuiltInType[],
  options: { useExtendedSdl: boolean }
) => {
  const editorInstance: EditorInstance = monaco.editor;
  const disposables: IDisposable[] = [];
  const providers: IDisposable[] = [];

  const client = new WorkerManager({
    languageId: 'graphql',
    options: options,
  });
  disposables.push(client);

  const worker: WorkerAccessor = (
    ...uris: Uri[]
  ): Promise<FdmGraphQLDmlWorker> => {
    try {
      // eslint-disable-next-line
      return client!.getLanguageServiceWorker(...uris) as any;
    } catch (err) {
      throw new Error('Error fetching graphql language service worker');
    }
  };

  function registerProviders(): void {
    disposeAll(providers);

    providers.push(
      new DiagnosticsAdapter(config.languageId, editorInstance, worker)
    );

    providers.push(
      monaco.languages.registerCompletionItemProvider(
        config.languageId,
        new CodeCompletionProvider(worker, builtInTypes)
      )
    );

    providers.push(
      monaco.languages.registerDocumentFormattingEditProvider(
        config.languageId,
        new DocumentFormattingAdapter(worker)
      )
    );
  }

  registerProviders();

  disposables.push(asDisposable(providers));

  // Monaco editor returns object with dispose method so it can clear out everything for us
  return asDisposable(disposables);
};

function asDisposable(disposables: IDisposable[]): IDisposable {
  return { dispose: () => disposeAll(disposables) };
}

function disposeAll(disposables: IDisposable[]) {
  while (disposables.length) {
    // eslint-disable-next-line
    disposables.pop()!.dispose();
  }
}
