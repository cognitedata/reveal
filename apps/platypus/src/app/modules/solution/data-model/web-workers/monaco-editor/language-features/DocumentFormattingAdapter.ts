import type { CancellationToken, languages } from 'monaco-editor';
import { editor } from 'monaco-editor/esm/vs/editor/editor.api';

import { WorkerAccessor } from '../../types';

export class DocumentFormattingAdapter
  implements languages.DocumentFormattingEditProvider
{
  constructor(private _worker: WorkerAccessor) {
    this._worker = _worker;
  }

  async provideDocumentFormattingEdits(
    document: editor.ITextModel,
    _options: languages.FormattingOptions,
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
