import { useQuery, UseQueryResult } from 'react-query';

import { mergeUniqueArray } from 'utils/merge';

import { DocumentFilter } from '@cognite/sdk';

import { DOCUMENTS_AGGREGATES } from 'constants/react-query';
import { useProjectConfig } from 'hooks/useProjectConfig';
import { documentSearchService } from 'modules/documentSearch/service';
import {
  AggregateNames,
  BatchedDocumentsFilters,
  CategoryResponse,
  SearchQueryFull,
} from 'modules/documentSearch/types';

export const useDocumentsCategories = (
  searchQuery: SearchQueryFull,
  category: AggregateNames,
  batchedDocumentsFilters?: BatchedDocumentsFilters
): UseQueryResult<CategoryResponse> => {
  const { data: projectConfig } = useProjectConfig();

  const query = {
    ...searchQuery,
    facets: {
      ...searchQuery.facets,
      [category]: [],
    },
  };

  const configFilters: DocumentFilter = projectConfig?.documents?.filters || {};

  const batchedFilters = batchedDocumentsFilters || [
    { filters: configFilters },
  ];

  return useQuery<CategoryResponse>(
    [DOCUMENTS_AGGREGATES[category], query, ...batchedFilters],
    async () => {
      const results = await Promise.all(
        batchedFilters.map(({ filters }) => {
          return documentSearchService.getCategoriesByQuery({
            query,
            filters: { ...filters, ...configFilters },
            category,
          });
        })
      );

      return results.reduce(mergeUniqueArray, {} as CategoryResponse);
    }
  );
};
