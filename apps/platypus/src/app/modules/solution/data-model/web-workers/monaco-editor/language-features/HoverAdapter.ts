import type {
  Position,
  CancellationToken,
  IDisposable,
  languages,
} from 'monaco-editor';
import { editor, Range } from 'monaco-editor/esm/vs/editor/editor.api';

import { WorkerAccessor } from '../../types';

export class HoverAdapter implements languages.HoverProvider, IDisposable {
  constructor(private _worker: WorkerAccessor) {
    this._worker = _worker;
  }

  async provideHover(
    model: editor.IReadOnlyModel,
    position: Position,
    _token: CancellationToken
  ): Promise<languages.Hover> {
    const worker = await this._worker(model.uri);

    const hoverItemFromWorker = await worker.doHover(position);
    const hoverItem = {
      range: new Range(
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
      } as languages.Hover;
    }

    return {
      contents: [],
    };
  }

  // eslint-disable-next-line
  dispose() {}
}
