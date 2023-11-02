import { InternalDocumentFilter } from '@data-exploration-lib/core';

import { useFileSearchQuery } from '../../../files';
import { TableSortBy } from '../../../types';
import { useDocumentSearchResultQuery } from '../../internal';

export const useShamefulDocumentsQuery = (
  {
    sortBy,
    query,
    filter,
    limit,
  }: {
    sortBy: TableSortBy[];
    query: string;
    filter: InternalDocumentFilter;
    limit: number;
  },
  {
    isEnabled,
    isDocumentsApiEnabled,
  }: {
    isEnabled: boolean;
    isDocumentsApiEnabled: boolean;
  }
) => {
  // If Documents API is not enabled, then pipe reduced query to the Files API and return a transparently consistent result
  // Once Document API is enabled in all clusters (EOY 2023), then calls to this can be removed and just be forwarded to
  // useDocumentSearchResultQuery
  const filesApiReturn = useFileSearchQuery(
    {
      filter: {
        assetSubtreeIds: filter['assetSubtreeIds']?.map((id) => ({
          id: id.value,
        })),
      },
      limit,
    },
    { enabled: !isDocumentsApiEnabled && isEnabled }
  );

  const documentsApiReturn = useDocumentSearchResultQuery(
    {
      sortBy,
      query,
      filter,
      limit,
    },
    { enabled: isDocumentsApiEnabled && isEnabled }
  );

  if (isDocumentsApiEnabled) {
    return {
      results: documentsApiReturn.results ?? [],
      hasNextPage: documentsApiReturn.hasNextPage,
      fetchNextPage: documentsApiReturn.fetchNextPage,
      isInitialLoading: documentsApiReturn.isInitialLoading,
    };
  }

  return {
    results: filesApiReturn.results ?? [],
    hasNextPage: filesApiReturn.hasNextPage,
    fetchNextPage: filesApiReturn.fetchNextPage,
    isInitialLoading: filesApiReturn.isInitialLoading,
  };
};
