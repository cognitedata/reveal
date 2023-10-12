import {
  editor,
  languages,
  Position,
} from 'monaco-editor/esm/vs/editor/editor.api';

import { WorkerAccessor } from '../../types';

import CompletionItemProvider = languages.CompletionItemProvider;
import CompletionList = languages.CompletionList;

/**
 * Provides code completion items for code editor.
 * This is the class that we need to implement so that the monaco can use it.
 * Copied from here
 * https://github.com/microsoft/monaco-editor/blob/main/src/language/common/lspLanguageFeatures.ts
 */
export class CodeCompletionProvider implements CompletionItemProvider {
  // Run this function when the period or open parenthesis is typed
  triggerCharacters = [':', '[', ']', '@', '(', ',', '"', ' '];

  constructor(private readonly _worker: WorkerAccessor) {}

  async provideCompletionItems(
    model: editor.ITextModel,
    position: Position
  ): Promise<CompletionList> {
    const resource = model.uri;

    // get the text from current line
    const textUntilPosition = model.getValueInRange({
      startLineNumber: position.lineNumber,
      startColumn: 1,
      endLineNumber: position.lineNumber,
      endColumn: position.column,
    });

    const worker = await this._worker(resource);

    const suggestions = await worker.doComplete(
      textUntilPosition,
      model.getValue(),
      position
    );
    return suggestions as CompletionList;
  }
}
