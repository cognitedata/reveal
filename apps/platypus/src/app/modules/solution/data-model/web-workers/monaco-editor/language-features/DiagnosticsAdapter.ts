import { DataModelValidationError } from '@platypus/platypus-core';
import {
  editor,
  IDisposable,
  MarkerSeverity,
  Thenable,
  Uri,
} from 'monaco-editor/esm/vs/editor/editor.api';

import { config } from '../../config';
import { FdmGraphQLDmlWorker } from '../../FdmGraphQLDmlWorker';
import { EditorInstance, ValidationMarker } from '../../types';

export interface WorkerAccessor {
  (...more: Uri[]): Thenable<FdmGraphQLDmlWorker>;
}

//#region DiagnosticsAdapter
/**
 * Class that handles code editor changes and do validation
 * And disposes unused resources
 *
 */
export class DiagnosticsAdapter {
  protected readonly _disposables: IDisposable[] = [];
  private readonly _listener: { [uri: string]: IDisposable } =
    Object.create(null);

  /**
   * think 2 times about adding additional input here, as this adaptor only should
   * provide validation and errors, which means it should only need
   *
   * @param _languageId the lanugage to check for
   * @param editorInstance the editor instance to check upon (mostly for current content within editor)
   * @param _worker how to access worker
   */
  constructor(
    private readonly _languageId: string,
    protected readonly editorInstance: EditorInstance,
    private _worker: WorkerAccessor
  ) {
    this._worker = _worker;
    const onModelAdd = (model: editor.IModel): void => {
      let handle: number;

      const modelUri = model.uri.toString();

      // collect event listener handle so we can dispose later
      // add debounce and validate code in the editor
      // with the provided validator function
      this._listener[modelUri] = model.onDidChangeContent(() => {
        window.clearTimeout(handle);
        handle = window.setTimeout(() => {
          this._doValidate(model.uri, editorInstance, model, model.getValue());
        }, 500);
      });

      this._doValidate(model.uri, editorInstance, model, model.getValue());
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
  private async _doValidate(
    resource: Uri,
    editorInstance: EditorInstance,
    model: editor.IModel,
    editorContent: string
  ): Promise<void> {
    const worker = await this._worker(resource);

    const diagnostics = await worker.doValidation(editorContent);

    const markers = [] as ValidationMarker[];

    // if no errors, we have valid graphql schema
    // put it in cache and parse the type defs
    // so we can use it later for other stuff
    if (!diagnostics.length && editorContent) {
      await worker.setGraphQlSchema(editorContent);
    }

    // Monaco editor needs them as separate lines
    (diagnostics as DataModelValidationError[]).forEach((validationError) => {
      const locations = validationError.locations || [];

      locations.forEach((validationErrorLocation) => {
        const err = {
          severity: validationError.extensions?.breakingChangeInfo
            ? MarkerSeverity.Warning
            : MarkerSeverity.Error,
          startLineNumber: validationErrorLocation.line,
          startColumn: 1,
          endLineNumber: validationErrorLocation.line,
          endColumn: validationErrorLocation.column,
          message: validationError.message,
        };

        markers.push(err);
      });
    });

    // return markers;
    editorInstance.setModelMarkers(model, config.languageId, markers);
  }
}

//#endregion
