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

export const findPidLink = (
  fileConnection: FileConnectionInstance,
  currentGraph: GraphDocument,
  documents: GraphDocument[]
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
      unit: fileConnection.unit || currentGraph.documentMetadata.unit, // either the explicit unit or the same as current
    })
  );

  if (connectedDoc === undefined) return undefined;

  const connectedInstance = connectedDoc?.symbolInstances.find(
    (symbol) =>
      isFileConnection(symbol) && symbol.position === fileConnection.toPosition
  );

  if (connectedInstance === undefined) return undefined;

  const ownAnnotation: AnnotationId = {
    documentId: currentGraph.documentMetadata.name,
    annotationId: getDiagramInstanceIdFromPathIds(fileConnection.pathIds),
  };

  const connectedAnnotation: AnnotationId = {
    documentId: connectedDoc.documentMetadata.name,
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
  allDocuments: GraphDocument[]
): DocumentLink | undefined => {
  const linkedDocument =
    lineConnection.pointsToFileName === 'SAME'
      ? document
      : allDocuments.find(
          (doc) => doc.documentMetadata.name === lineConnection.pointsToFileName
        );

  if (linkedDocument === undefined) return undefined;

  const linkedConnection = linkedDocument.symbolInstances.find(
    (symbol) =>
      isLineConnection(symbol) &&
      symbol.letterIndex === lineConnection.letterIndex
  );

  if (linkedConnection === undefined) return undefined;

  return {
    from: {
      documentId: document.documentMetadata.name,
      annotationId: getDiagramInstanceIdFromPathIds(lineConnection.pathIds),
    },
    to: {
      documentId: linkedDocument.documentMetadata.name,
      annotationId: getDiagramInstanceIdFromPathIds(linkedConnection.pathIds),
    },
  };
};
