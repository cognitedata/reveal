import React, { useEffect, useMemo } from 'react';
import { useDocumentFilters as useDocumentSearchFilters } from '@cognite/react-document-search';
import { TableSortBy } from 'components/Table';
import {
  mapTableSortByToDocumentSortFields,
  mapFiltersToDocumentSearchFilters,
  InternalDocumentFilter,
} from 'domain/documents';

export const useObserveDocumentSearchFilters = (
  query: string,
  documentsFilters: InternalDocumentFilter = {},
  sortBy?: TableSortBy[]
) => {
  const { setAppliedFilters } = useDocumentSearchFilters();

  const transformFilter = React.useMemo(
    () => mapFiltersToDocumentSearchFilters(documentsFilters, query),
    [documentsFilters, query]
  );

  const sort = useMemo(
    () => mapTableSortByToDocumentSortFields(sortBy),
    [sortBy]
  );

  useEffect(() => {
    setAppliedFilters({
      search: {
        query: query || '',
      },
      filter: transformFilter as any, // Fixme: Looking into it in future PRs
      sort,
    });
  }, [query, setAppliedFilters, transformFilter, sort]);
};
