import isMatch from 'lodash/isMatch';

import {
  FileConnectionInstance,
  GraphDocument,
  DocumentType,
  LineConnectionInstance,
} from '../types';
import { isFileConnection, isLineConnection } from '../utils/type';
import { getDiagramInstanceIdFromPathIds } from '../utils/diagramInstanceUtils';

import { DocumentLink, AnnotationId } from './types';
import { getExtId, getFileNameWithoutExtension } from './utils';

export const findPidLink = (
  fileConnection: FileConnectionInstance,
  document: GraphDocument,
  documents: GraphDocument[],
  version: string
): DocumentLink | undefined => {
  // Currently only supports single direction connections
  if (
    fileConnection.fileDirection !== 'In' &&
    fileConnection.fileDirection !== 'Out'
  ) {
    return undefined;
  }

  const connectedDoc = documents.find((document) =>
    isMatch(document.documentMetadata, {
      type: DocumentType.pid,
      documentNumber: fileConnection.documentNumber,
      unit: fileConnection.unit || document.documentMetadata.unit, // either the explicit unit or the same as current
    })
  );

  if (connectedDoc === undefined) return undefined;

  const connectedInstance = connectedDoc?.symbolInstances.find(
    (symbol) =>
      isFileConnection(symbol) && symbol.position === fileConnection.toPosition
  );

  if (connectedInstance === undefined) return undefined;

  const ownAnnotation: AnnotationId = {
    documentId: getExtId(document.documentMetadata.name, version),
    annotationId: getDiagramInstanceIdFromPathIds(fileConnection.pathIds),
  };

  const connectedAnnotation: AnnotationId = {
    documentId: getExtId(connectedDoc.documentMetadata.name, version),
    annotationId: getDiagramInstanceIdFromPathIds(connectedInstance.pathIds),
  };

  if (fileConnection.fileDirection === 'In') {
    return {
      from: connectedAnnotation,
      to: ownAnnotation,
    };
  }

  return {
    from: ownAnnotation,
    to: connectedAnnotation,
  };
};

export const findIsoLink = (
  lineConnection: LineConnectionInstance,
  document: GraphDocument,
  allDocuments: GraphDocument[],
  version: string
): DocumentLink | undefined => {
  const linkedDocument =
    lineConnection.pointsToFileName === 'SAME'
      ? document
      : allDocuments.find(
          (doc) =>
            getFileNameWithoutExtension(doc.documentMetadata.name) ===
            lineConnection.pointsToFileName
        );

  if (linkedDocument === undefined) return undefined;

  const symbolIsNotCurrentConnection = (symbol: LineConnectionInstance) =>
    linkedDocument.documentMetadata.name !== document.documentMetadata.name ||
    symbol.id !== lineConnection.id;

  const symbolPointsToCurrentDocument = (symbol: LineConnectionInstance) =>
    symbol.pointsToFileName ===
    (lineConnection.pointsToFileName === 'SAME'
      ? 'SAME'
      : getFileNameWithoutExtension(document.documentMetadata.name));

  const linkedConnection = linkedDocument.symbolInstances.find(
    (symbol) =>
      isLineConnection(symbol) &&
      symbol.letterIndex === lineConnection.letterIndex &&
      symbolIsNotCurrentConnection(symbol) &&
      symbolPointsToCurrentDocument(symbol)
  );

  if (linkedConnection === undefined) return undefined;

  return {
    from: {
      documentId: getExtId(document.documentMetadata.name, version),
      annotationId: lineConnection.id,
    },
    to: {
      documentId: getExtId(linkedDocument.documentMetadata.name, version),
      annotationId: linkedConnection.id,
    },
  };
};
