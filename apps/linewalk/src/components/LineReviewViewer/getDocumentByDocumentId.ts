import { Document } from '../../modules/lineReviews/types';

const getDocumentByDocumentId = (
  documents: Document[],
  documentId: string
): Document => {
  const document = documents.find((document) => document.id === documentId);

  if (document === undefined) {
    throw new Error(`No document with id ${documentId}`);
  }

  return document;
};

export default getDocumentByDocumentId;
