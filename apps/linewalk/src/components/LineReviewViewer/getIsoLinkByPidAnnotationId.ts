import { Document, DocumentType, Link } from '../../modules/lineReviews/types';

import getDocumentByDocumentId from './getDocumentByDocumentId';

const getIsoLinkByPidAnnotationId = (
  documents: Document[],
  pidPathId: string
): Link | undefined => {
  const match: Link | undefined = documents
    .filter(({ type }) => type === DocumentType.PID)
    .flatMap(({ _linking }) => _linking)
    .filter(
      (link) =>
        getDocumentByDocumentId(documents, link.to.documentId).type ===
        DocumentType.ISO
    )
    .find((link) => link.from.instanceId === pidPathId);

  if (match === undefined) {
    return undefined;
  }

  return match;
};

export default getIsoLinkByPidAnnotationId;
