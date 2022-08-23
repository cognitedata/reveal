import { useMemo } from 'react';
import {
  DocumentCategories,
  DocumentPayload,
} from '@cognite/discover-api-types';
import isUndefined from 'lodash/isUndefined';

import { DocumentQueryFacets } from '../utils/types';

import { useDocumentAggregateResponse } from './useDocumentAggregateResponse';
import { useDocumentSearchQueryFull } from './useDocumentSearchQueryFull';
import { useDocumentCategoryQuery } from './useDocumentQuery';

export const patchDocumentPayloadCount = (
  currentContent: DocumentPayload[],
  patchContent?: DocumentPayload[]
): DocumentPayload[] => {
  if (!patchContent) {
    return currentContent;
  }

  return currentContent.map((currentItem) => {
    const itemToPatch = patchContent.find((patchItem) =>
      'id' in currentItem
        ? patchItem.name === currentItem.id
        : patchItem.name === currentItem.name
    );

    const patchedItem = isUndefined(itemToPatch)
      ? { ...currentItem, count: 0 }
      : { ...currentItem, count: itemToPatch.count };

    return patchedItem;
  });
};

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

export const getEmptyDocumentCategories = (): DocumentCategories => ({
  documentType: [],
  fileCategory: [],
  fileType: [],
  labels: [],
  location: [],
  pageCount: [],
});

export const useDocumentQueryFacets = () => {
  const { isLoading, error, data } = useDocumentCategoryQuery();
  const searchQuery = useDocumentSearchQueryFull();
  const aggregateResponse = useDocumentAggregateResponse(searchQuery);

  return useMemo(() => {
    if (!data || 'error' in data) {
      return {
        isLoading,
        error,
        data: getEmptyDocumentCategories(),
      };
    }

    return {
      isLoading,
      error,
      data: getAvailableDocumentCategories(data, aggregateResponse),
    };
  }, [data, aggregateResponse]);
};
