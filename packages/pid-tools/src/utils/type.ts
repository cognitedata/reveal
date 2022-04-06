import {
  DiagramLineInstance,
  DiagramType,
  PidFileConnectionInstance,
  PidDocumentMetadata,
  IsoDocumentMetadata,
  DocumentType,
  DocumentMetadata,
  DiagramEquipmentInstance,
  DiagramInstrumentInstance,
  LineConnectionInstance,
  DiagramInstance,
  DiagramEquipmentTagInstance,
} from '../types';
import { LineSegment, PathSegment } from '../geometry';

export const isFileConnection = (
  diagramInstance: any
): diagramInstance is PidFileConnectionInstance => {
  const fileConnection: DiagramType = 'File Connection';
  return diagramInstance.type === fileConnection;
};

export const isLineConnection = (
  diagramInstance: any
): diagramInstance is LineConnectionInstance => {
  const lineConnection: DiagramType = 'Line Connection';
  return diagramInstance.type === lineConnection;
};

export const isEquipment = (
  diagramInstance: DiagramInstance
): diagramInstance is DiagramEquipmentInstance =>
  diagramInstance.type === 'Equipment';

export const isEquipmentTag = (
  diagramInstance: DiagramInstance
): diagramInstance is DiagramEquipmentTagInstance =>
  diagramInstance.type === 'EquipmentTag';

export const isInstrument = (
  diagramInstance: DiagramInstance
): diagramInstance is DiagramInstrumentInstance =>
  diagramInstance.type === 'Instrument';

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

export const isLineSegment = (
  pathSegment: PathSegment
): pathSegment is LineSegment => {
  return pathSegment && pathSegment.pathType === 'LineSegment';
};

export const isIsoDocumentMetadata = (
  documentMetadata: DocumentMetadata
): documentMetadata is IsoDocumentMetadata => {
  return documentMetadata.type === DocumentType.isometric;
};
