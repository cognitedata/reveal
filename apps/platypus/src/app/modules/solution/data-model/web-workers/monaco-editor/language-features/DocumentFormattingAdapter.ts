import type { CancellationToken } from 'monaco-editor';
import * as monaco from 'monaco-editor';
import { editor } from 'monaco-editor';

import { WorkerAccessor } from '../../types';

export class DocumentFormattingAdapter
  implements monaco.languages.DocumentFormattingEditProvider
{
  constructor(private _worker: WorkerAccessor) {
    this._worker = _worker;
  }

  async provideDocumentFormattingEdits(
    document: editor.ITextModel,
    _options: monaco.languages.FormattingOptions,
    _token: CancellationToken
  ) {
    const worker = await this._worker(document.uri);

    const formatted = await worker.doFormat(document.getValue());
    if (!formatted) {
      return [];
    }
    return [
      {
        range: document.getFullModelRange(),
        text: formatted,
      },
    ];
  }
}
