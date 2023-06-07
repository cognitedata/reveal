import type { editor as MonacoEditor } from 'monaco-editor';

export type ErrorsByGroup = {
  [Group in string]: MonacoEditor.IMarkerData[];
};
