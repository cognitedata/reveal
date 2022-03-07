import uniqBy from 'lodash/uniqBy';

import { ParsedDocument } from '../../modules/lineReviews/types';

import getDocumentByAnnotationId from './getDocumentByAnnotationId';

const getUniqueDocumentsByDiscrepancy = (
  documents: ParsedDocument[],
  annotationIds: string[]
) =>
  uniqBy(
    annotationIds.map((annotationId) =>
      getDocumentByAnnotationId(documents, annotationId)
    ),
    (document: ParsedDocument) => document.externalId
  );

export default getUniqueDocumentsByDiscrepancy;
