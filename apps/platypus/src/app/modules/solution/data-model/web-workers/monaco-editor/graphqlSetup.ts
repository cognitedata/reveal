import { Monaco } from '@monaco-editor/react';
import { IDisposable, Uri } from 'monaco-editor/esm/vs/editor/editor.api';

import { config } from '../config';
import { FdmGraphQLDmlWorker } from '../FdmGraphQLDmlWorker';
import { EditorInstance, WorkerAccessor } from '../types';

import { CodeActionProvider, DiagnosticsAdapter } from './language-features';
import { CodeCompletionProvider } from './language-features/CodeCompletionProvider';
import { DocumentFormattingAdapter } from './language-features/DocumentFormattingAdapter';
import { HoverAdapter } from './language-features/HoverAdapter';
import { WorkerManager } from './workerManager';

/**
 * File that is used to setup or wire up web worker and all monaco stuff
 */
export const setupGraphql = (
  monaco: Monaco,
  options: { useExtendedSdl: boolean }
) => {
  const editorInstance: EditorInstance = monaco.editor;
  const disposables: IDisposable[] = [];
  const providers: IDisposable[] = [];

  // Provide a custom folding region support
  monaco.languages.setLanguageConfiguration('graphql', {
    folding: {
      offSide: false,
      markers: {
        start: new RegExp(/^#region/),
        end: new RegExp(/^#endregion/),
      },
    },
  });

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

    // Provides details around validation
    providers.push(
      new DiagnosticsAdapter(config.languageId, editorInstance, worker)
    );

    // Provides autocomplete around where the current line is
    providers.push(
      monaco.languages.registerCompletionItemProvider(
        config.languageId,
        new CodeCompletionProvider(worker)
      )
    );

    // Provides formatting (prettier) around where the current line is
    providers.push(
      monaco.languages.registerDocumentFormattingEditProvider(
        config.languageId,
        new DocumentFormattingAdapter(worker)
      )
    );

    if (options.useExtendedSdl) {
      // Provides hover details when it is triggered
      providers.push(
        monaco.languages.registerHoverProvider(
          config.languageId,
          new HoverAdapter(worker)
        )
      );
      // Provides actions when there is an error
      providers.push(
        monaco.languages.registerCodeActionProvider(
          config.languageId,
          new CodeActionProvider(worker)
        )
      );
    }
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
