import { editor, languages } from 'monaco-editor/esm/vs/editor/editor.api';

import { EditorInstance, WorkerAccessor } from '../../types';
export class CodeLensProvider implements languages.CodeLensProvider {
  constructor(
    private _worker: WorkerAccessor,
    protected readonly editorInstance: EditorInstance
  ) {
    this._worker = _worker;
  }

  async provideCodeLenses(
    model: editor.ITextModel
  ): Promise<languages.CodeLensList> {
    const worker = await this._worker(model.uri);

    const editors = this.editorInstance.getEditors();
    const isEditorDisabled = editors.length
      ? editors[0].getRawOptions().readOnly
      : true;

    if (!isEditorDisabled) {
      const lenses = {
        lenses: [],
        // eslint-disable-next-line
        dispose: () => {},
      };

      return lenses;
    }

    const codeLenses = await worker.getCodeLens();
    return {
      lenses: codeLenses || [],
      // eslint-disable-next-line
      dispose: () => {},
    };
  }
  resolveCodeLens?(
    model: editor.ITextModel,
    codeLens: languages.CodeLens
  ): languages.ProviderResult<languages.CodeLens> {
    return codeLens;
  }
}
