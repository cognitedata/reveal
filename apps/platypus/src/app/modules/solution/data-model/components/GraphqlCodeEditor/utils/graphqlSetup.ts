import { BuiltInType } from '@platypus/platypus-core';
import { Monaco } from '@monaco-editor/react';
import { IDisposable } from 'monaco-editor';
import { config } from './config';
import { DiagnosticsAdapter } from './languageServiceFeatures';
import { autoCompleteProvider } from './codeCompletitionProvider';
import { EditorInstance, ValidateFunction } from './types';

export const setupGraphql = (
  monaco: Monaco,
  builtInTypes: BuiltInType[],
  validator: ValidateFunction
) => {
  const editorInstance: EditorInstance = monaco.editor;
  const disposables: IDisposable[] = [];
  const providers: IDisposable[] = [];

  function registerProviders(): void {
    disposeAll(providers);

    providers.push(
      new DiagnosticsAdapter(config.languageId, editorInstance, validator)
    );

    providers.push(
      monaco.languages.registerCompletionItemProvider(
        config.languageId,
        autoCompleteProvider(builtInTypes)
      )
    );
  }

  registerProviders();

  disposables.push(asDisposable(providers));

  return asDisposable(disposables);
};

function asDisposable(disposables: IDisposable[]): IDisposable {
  return { dispose: () => disposeAll(disposables) };
}

function disposeAll(disposables: IDisposable[]) {
  while (disposables.length) {
    disposables.pop()!.dispose();
  }
}
