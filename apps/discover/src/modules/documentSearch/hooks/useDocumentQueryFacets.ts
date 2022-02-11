import { useMemo } from 'react';

import isUndefined from 'lodash/isUndefined';

import { DocumentCategoriesFacets } from 'modules/api/documents/types';
import { useDocumentCategoryQuery } from 'modules/api/documents/useDocumentQuery';

import { patchDocumentPayloadCount } from '../utils/availableDocumentResultsCount';

import { useDocumentsCategories } from './useDocumentsCategories';

let documentCategoryData: DocumentCategoriesFacets;

export const useDocumentQueryFacets = () => {
  const { isLoading, error, data } = useDocumentCategoryQuery();

  const { data: filetypeResponse } = useDocumentsCategories('filetype');
  const { data: labelsResponse } = useDocumentsCategories('labels');
  const { data: locationResponse } = useDocumentsCategories('location');
  const { data: pageCountResponse } = useDocumentsCategories('pageCount');

  const isDocumentsCategoriesDataUndefined =
    isUndefined(filetypeResponse) ||
    isUndefined(labelsResponse) ||
    isUndefined(locationResponse);

  const aggregateResponse = {
    filetype: filetypeResponse?.facets,
    labels: labelsResponse?.facets,
    location: locationResponse?.facets,
    pageCount: pageCountResponse?.facets,
  };

  return useMemo(() => {
    if (!data || 'error' in data) {
      return { isLoading, error, data };
    }

    if (
      !isUndefined(documentCategoryData) &&
      isDocumentsCategoriesDataUndefined
    ) {
      return { isLoading, error, data: documentCategoryData };
    }

    documentCategoryData = {
      fileCategory: patchDocumentPayloadCount(
        data.fileCategory,
        aggregateResponse.filetype || data.fileCategory
      ),
      labels: patchDocumentPayloadCount(
        data.labels,
        aggregateResponse.labels || data.labels
      ),
      location: patchDocumentPayloadCount(
        data.location,
        aggregateResponse.location || data.location
      ),
      pageCount: aggregateResponse.pageCount || data.pageCount,
    };

    return { isLoading, error, data: documentCategoryData };
  }, [data, aggregateResponse]);
};
