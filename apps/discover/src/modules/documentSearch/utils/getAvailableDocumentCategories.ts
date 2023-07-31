import { DocumentCategories } from '@cognite/discover-api-types';

import { DocumentQueryFacets } from '../types';

import { patchDocumentPayloadCount } from './availableDocumentResultsCount';

export const getAvailableDocumentCategories = (
  staticDocumentCategories: DocumentCategories,
  aggregateResponse: Partial<DocumentQueryFacets>
): DocumentCategories => {
  return {
    ...staticDocumentCategories,
    fileCategory: patchDocumentPayloadCount(
      staticDocumentCategories.fileCategory,
      aggregateResponse.fileCategory
    ),
    labels: patchDocumentPayloadCount(
      staticDocumentCategories.labels,
      aggregateResponse.labels
    ),
    location: patchDocumentPayloadCount(
      staticDocumentCategories.location,
      aggregateResponse.location
    ),
    pageCount:
      aggregateResponse.pageCount || staticDocumentCategories.pageCount,
  };
};
