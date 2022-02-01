import {
  DiagramInstance,
  DiagramLineInstance,
  DiagramType,
  FileConnectionInstance,
  PidDocumentMetadata,
  IsoDocumentMetadata,
  DocumentType,
  DocumentMetadata,
} from '../types';

export const isOfDiagramType = <T extends DiagramInstance>(
  diagramInstance: any,
  diagramType: DiagramType
): diagramInstance is T => diagramInstance.type === diagramType;

export const isFileConnection = (
  diagramInstance: any
): diagramInstance is FileConnectionInstance => {
  const fileConnection: DiagramType = 'File connection';
  return diagramInstance.type === fileConnection;
};

export const isLine = (
  diagramInstance: any
): diagramInstance is DiagramLineInstance => {
  const line: DiagramType = 'Line';
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
