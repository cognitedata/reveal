import { editor } from 'monaco-editor';
export type EditorInstance = typeof editor;

export interface ValidationError {
  message: string;
  line: number;
  column: number;
}

export interface ValidateSchemaError {
  message: string;
  locations: ValidationError[];
}

export type ValidationMarker = editor.IMarkerData;
export type ValidateFunction = (edtorContent: string) => ValidationMarker[];
