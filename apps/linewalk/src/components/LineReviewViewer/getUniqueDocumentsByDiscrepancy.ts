import uniqBy from 'lodash/uniqBy';

import { Document } from '../../modules/lineReviews/types';

import getDocumentByAnnotationId from './getDocumentByAnnotationId';

const getUniqueDocumentsByDiscrepancy = (
  documents: Document[],
  annotationIds: string[]
) =>
  uniqBy(
    annotationIds.map((annotationId) =>
      getDocumentByAnnotationId(documents, annotationId)
    ),
    (document: Document) => document.fileExternalId
  );

export default getUniqueDocumentsByDiscrepancy;
