import { LineSegment, PathSegment } from 'geometry';

import { verticalOrientations, horizontalOrientations } from '../constants';
import {
  DiagramLineInstance,
  DiagramType,
  FileConnectionInstance,
  PidDocumentMetadata,
  IsoDocumentMetadata,
  DocumentType,
  DocumentMetadata,
  DiagramEquipmentInstance,
  DiagramInstanceWithPaths,
  LineConnectionInstance,
  HorizontalOrientation,
  VerticalOrientation,
  Orientation,
} from '../types';

export const isFileConnection = (
  diagramInstance: any
): diagramInstance is FileConnectionInstance => {
  const fileConnection: DiagramType = 'File connection';
  return diagramInstance.type === fileConnection;
};

export const isLineConnection = (
  diagramInstance: any
): diagramInstance is LineConnectionInstance => {
  const lineConnection: DiagramType = 'Line connection';
  return diagramInstance.type === lineConnection;
};

export const isEquipment = (
  diagramInstance: DiagramInstanceWithPaths
): diagramInstance is DiagramEquipmentInstance =>
  diagramInstance.type === 'Equipment';

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

export const isHorizontalOrientaiton = (
  orientation: Orientation
): orientation is HorizontalOrientation => {
  return horizontalOrientations.some((horOr) => horOr === orientation);
};

export const isVerticalOrientaiton = (
  orientation: Orientation
): orientation is VerticalOrientation => {
  return verticalOrientations.some((verOr) => verOr === orientation);
};

export const isLineSegment = (
  pathSegment: PathSegment
): pathSegment is LineSegment => {
  return pathSegment.pathType === 'LineSegment';
};
