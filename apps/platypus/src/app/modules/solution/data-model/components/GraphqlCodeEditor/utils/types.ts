import { editor } from 'monaco-editor';
export type EditorInstance = typeof editor;

export type ValidationMarker = editor.IMarkerData;
export type ValidateFunction = (
  graphqlString: string
) => Promise<ValidationMarker[]>;
