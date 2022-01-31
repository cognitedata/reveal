import {
  DiagramInstance,
  DiagramLineInstance,
  DiagramTypes,
  FileConnectionInstance,
  PidDocumentMetadata,
  IsoDocumentMetadata,
  DocumentType,
  DocumentMetadata,
} from '../types';

export const isOfDiagramType = <T extends DiagramInstance>(
  diagramInstance: any,
  diagramType: DiagramTypes
): diagramInstance is T => diagramInstance.type === diagramType;

export const isFileConnection = (
  diagramInstance: any
): diagramInstance is FileConnectionInstance => {
  const fileConnection: DiagramTypes = 'File connection';
  return diagramInstance.type === fileConnection;
};

export const isLine = (
  diagramInstance: any
): diagramInstance is DiagramLineInstance => {
  const line: DiagramTypes = 'Line';
  return diagramInstance.type === line;
};

export const isPid = (
  documentMetadata: DocumentMetadata
): documentMetadata is PidDocumentMetadata => {
  return documentMetadata.type === DocumentType.pid;
};

export const isIso = (
  documentMetadata: DocumentMetadata
): documentMetadata is IsoDocumentMetadata => {
  return documentMetadata.type === DocumentType.isometric;
};
