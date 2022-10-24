import { useEffect } from 'react';
import { useDocumentFilters as useDocumentSearchFilters } from '@cognite/react-document-search';
import { mapFiltersToDocumentSearchFilters } from '../transformers/mapFiltersToDocumentSearchFilters';
import { mapColumnsToDocumentSortFields } from '../transformers/mapColumnsToDocumentSortFields';
import React from 'react';
import { DocumentSort, InternalDocumentFilter } from '../types';

export const useObserveDocumentSearchFilters = (
  query: string,
  documentFilter: InternalDocumentFilter = {},
  { column, order }: DocumentSort
) => {
  const { setAppliedFilters } = useDocumentSearchFilters();
  // const [query] = useQueryString(SEARCH_KEY);
  // const [documentFilter] = useDocumentFilters();

  const transformFilter = React.useMemo(
    () => mapFiltersToDocumentSearchFilters(documentFilter),
    [documentFilter]
  );

  const sort = React.useMemo(() => {
    if (column !== undefined && order !== undefined) {
      return [
        {
          order: order,
          property: mapColumnsToDocumentSortFields(column),
        },
      ];
    }
  }, [order, column]);

  useEffect(() => {
    setAppliedFilters({
      search: {
        query: query || '',
      },
      filter: transformFilter as any, // Fixme: Looking into it in future PRs
      sort: sort,
    });
  }, [query, setAppliedFilters, transformFilter, sort]);
};
