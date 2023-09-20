import type { editor as MonacoEditor } from 'monaco-editor/esm/vs/editor/editor.api';

export type ErrorsByGroup = {
  [Group in string]: MonacoEditor.IMarkerData[];
};
