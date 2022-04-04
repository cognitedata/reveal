import { editor, IDisposable } from 'monaco-editor';
import { config } from './config';
import { EditorInstance, ValidateFunction } from './types';

//#region DiagnosticsAdapter
/**
 * Class that handles code editor changes and do validation
 * And disposes unused resources
 */
export class DiagnosticsAdapter {
  protected readonly _disposables: IDisposable[] = [];
  private readonly _listener: { [uri: string]: IDisposable } =
    Object.create(null);

  constructor(
    private readonly _languageId: string,
    protected readonly editorInstance: EditorInstance,
    private doValidation: ValidateFunction
  ) {
    const onModelAdd = (model: editor.IModel): void => {
      let handle: number;

      // collect event listener handle so we can dispose later
      // add debounce and validate code in the editor
      // with the provided validator function
      this._listener[model.uri.toString()] = model.onDidChangeContent(() => {
        window.clearTimeout(handle);
        handle = window.setTimeout(
          () => this._doValidate(editorInstance, model, model.getValue()),
          500
        );
      });

      this._doValidate(editorInstance, model, model.getValue());
    };

    const onModelRemoved = (model: editor.IModel): void => {
      editorInstance.setModelMarkers(model, this._languageId, []);

      const uriStr = model.uri.toString();
      const listener = this._listener[uriStr];
      if (listener) {
        listener.dispose();
        delete this._listener[uriStr];
      }
    };

    // collect event listener handle so we can dispose later
    this._disposables.push(editorInstance.onDidCreateModel(onModelAdd));
    this._disposables.push(editorInstance.onWillDisposeModel(onModelRemoved));
    this._disposables.push(
      editorInstance.onDidChangeModelLanguage((event) => {
        onModelRemoved(event.model);
        onModelAdd(event.model);
      })
    );

    // Monaco editor expects from us to implement IDisposable
    this._disposables.push({
      dispose: () => {
        editorInstance.getModels().forEach(onModelRemoved);
        for (const key in this._listener) {
          this._listener[key].dispose();
        }
      },
    });

    editorInstance.getModels().forEach(onModelAdd);
  }

  public dispose(): void {
    this._disposables.forEach((d) => d && d.dispose());
    this._disposables.length = 0;
  }

  // wrapper that do the validation and set errors in monaco editor
  private _doValidate(
    editorInstance: EditorInstance,
    model: editor.IModel,
    editorContent: string
  ): void {
    const markers = this.doValidation(editorContent);
    editorInstance.setModelMarkers(model, config.languageId, markers);
  }
}

//#endregion
