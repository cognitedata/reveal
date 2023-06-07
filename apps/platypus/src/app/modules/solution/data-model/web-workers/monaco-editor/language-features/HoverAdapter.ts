import * as monaco from 'monaco-editor';
import type { Position, CancellationToken, IDisposable } from 'monaco-editor';
import { editor } from 'monaco-editor/esm/vs/editor/editor.api';

import { WorkerAccessor } from '../../types';

export class HoverAdapter
  implements monaco.languages.HoverProvider, IDisposable
{
  constructor(private _worker: WorkerAccessor) {
    this._worker = _worker;
  }

  async provideHover(
    model: editor.IReadOnlyModel,
    position: Position,
    _token: CancellationToken
  ): Promise<monaco.languages.Hover> {
    const worker = await this._worker(model.uri);

    const hoverItemFromWorker = await worker.doHover(position);
    const hoverItem = {
      range: new monaco.Range(
        hoverItemFromWorker?.range.startLineNumber as number,
        hoverItemFromWorker?.range.startColumn as number,
        hoverItemFromWorker?.range.endLineNumber as number,
        hoverItemFromWorker?.range.endColumn as number
      ),
      content: hoverItemFromWorker?.content,
    };

    if (hoverItem) {
      return {
        range: hoverItem.range,
        contents: [{ value: hoverItem.content }],
      } as monaco.languages.Hover;
    }

    return {
      contents: [],
    };
  }

  // eslint-disable-next-line
  dispose() {}
}
