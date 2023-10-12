import {
  editor,
  languages,
  Range,
} from 'monaco-editor/esm/vs/editor/editor.api';

import {
  CodeActionEdit,
  CodeActionsOptions,
  CodeEditorRange,
  DiagnosticItem,
  EditorCodeAction,
} from '../../language-service/types';
import { WorkerAccessor } from '../../types';

/**
 * Provides commands for the given error in the monaco edtor using the
 * the [light bulb](https://code.visualstudio.com/docs/editor/editingevolved#_code-action) feature.
 */
export class CodeActionProvider implements languages.CodeActionProvider {
  constructor(private _worker: WorkerAccessor) {
    this._worker = _worker;
  }
  async provideCodeActions(
    model: editor.ITextModel,
    range: Range,
    context: languages.CodeActionContext
  ): Promise<languages.CodeActionList> {
    const worker = await this._worker(model.uri);
    // get the code as string from code editor
    const graphQlString = model.getValue();

    const lineCount = model.getLineCount();
    const codeActionsOptions = {
      lineCount,
      lastLineLength: model.getLineMaxColumn(lineCount),
    } as CodeActionsOptions;

    const codeActions = await worker.getCodeAction(
      graphQlString,
      this.toWorkerRange(range),
      context.markers.map((marker) => this.toDiagnosticItem(marker)),
      codeActionsOptions
    );

    return {
      actions: codeActions.map((edit) => this.toCodeAction(edit!, model)),
      // eslint-disable-next-line
      dispose() {
        // This is required by the TypeScript interface, but it’s not implemented.
      },
    };
  }

  private toCodeAction(
    codeAction: EditorCodeAction,
    model: editor.ITextModel
  ): languages.CodeAction {
    return {
      title: codeAction.title,
      edit: this.toWorkspaceEdit(codeAction.edit, model),
      kind: codeAction.kind,
      isPreferred: codeAction.isPreferred,
    };
  }

  private toWorkspaceEdit(
    edit: CodeActionEdit,
    model: editor.ITextModel
  ): languages.WorkspaceEdit {
    return {
      edits: edit.edits.map((workerEdit) => ({
        resource: model.uri,
        versionId: model.getVersionId(),
        textEdit: {
          text: workerEdit.edit.text,
          range: new Range(
            workerEdit.edit.range.startLineNumber,
            workerEdit.edit.range.startColumn,
            workerEdit.edit.range.endLineNumber,
            workerEdit.edit.range.endColumn
          ),
        },
      })),
    };
  }

  private toWorkerRange(range: Range): CodeEditorRange {
    return {
      startLineNumber: range.startLineNumber,
      startColumn: range.startColumn,
      endLineNumber: range.endLineNumber,
      endColumn: range.endColumn,
    } as CodeEditorRange;
  }

  private toDiagnosticItem(item: editor.IMarkerData): DiagnosticItem {
    return {
      startLineNumber: item.startLineNumber,
      startColumn: item.startColumn,
      endLineNumber: item.endLineNumber,
      endColumn: item.endColumn,
      message: item.message,
      code: item.code,
      source: item.source,
    };
  }
}
