import { GraphDocument, LineConnectionInstance } from '../types';
import { isLineConnection } from '../utils/type';
import { getDiagramInstanceIdFromPathIds } from '../utils/diagramInstanceUtils';

import { DocumentLink } from './types';

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
