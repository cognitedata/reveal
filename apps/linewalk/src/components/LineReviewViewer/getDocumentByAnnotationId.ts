import { Document } from '../../modules/lineReviews/types';

import getAnnotationsByDocument from './getAnnotationsByDocument';

const getDocumentByAnnotationId = (
  documents: Document[],
  annotationId: string
): Document => {
  const document = documents.find((document) =>
    getAnnotationsByDocument(document).some(
      (annotation) => annotation.id === annotationId
    )
  );

  if (document === undefined) {
    throw new Error(`No such document contained annotationId ${annotationId}`);
  }

  return document;
};

export default getDocumentByAnnotationId;
