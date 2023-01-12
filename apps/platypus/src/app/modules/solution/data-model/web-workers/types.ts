import { editor, Thenable, Uri } from 'monaco-editor';
import { FdmGraphQLDmlWorker } from './FdmGraphQLDmlWorker';
export type EditorInstance = typeof editor;

export type ValidationMarker = editor.IMarkerData;

export interface IFdmGraphQLDmlWorkerOptions {
  languageId: string;
  options?: { useExtendedSdl: boolean };
}

export interface WorkerAccessor {
  (...more: Uri[]): Thenable<FdmGraphQLDmlWorker>;
}
