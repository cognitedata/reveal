import React, { useEffect, useMemo } from 'react';
import { useDocumentFilters as useDocumentSearchFilters } from '@cognite/react-document-search';
import { mapFiltersToDocumentSearchFilters } from '../transformers/mapFiltersToDocumentSearchFilters';
import { mapColumnsToDocumentSortFields } from '../transformers/mapColumnsToDocumentSortFields';
import { DocumentSort, InternalDocumentFilter } from '../types';

export const useObserveDocumentSearchFilters = (
  query: string,
  documentFilter: InternalDocumentFilter = {},
  sortStateArr: DocumentSort[]
) => {
  const { setAppliedFilters } = useDocumentSearchFilters();
  // const [query] = useQueryString(SEARCH_KEY);
  // const [documentFilter] = useDocumentFilters();

  const transformFilter = React.useMemo(
    () => mapFiltersToDocumentSearchFilters(documentFilter),
    [documentFilter]
  );

  const sort = useMemo(() => {
    if (sortStateArr.length > 0) {
      const { column, order } = sortStateArr[0];

      return [
        {
          order: order,
          property: mapColumnsToDocumentSortFields(column!),
        },
      ];
    }

    return undefined;
  }, [sortStateArr]);

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
