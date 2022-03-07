import { ParsedDocument } from '../../modules/lineReviews/types';

const getDocumentByExternalId = (
  documents: ParsedDocument[],
  externalId: string
): ParsedDocument => {
  const document = documents.find(
    (document) => document.externalId === externalId
  );

  if (document === undefined) {
    throw new Error(`No document with id ${externalId}`);
  }

  return document;
};

export default getDocumentByExternalId;
