import { useEffect } from 'react';
import { useDocumentFilters as useDocumentSearchFilters } from '@cognite/react-document-search';
import { useQueryString } from 'app/hooks/hooks';
import { SEARCH_KEY } from 'app/utils/constants';
import { useDocumentFilters } from 'app/store/filter/selectors/documentSelectors';
import { mapFiltersToDocumentSearchFilters } from '../transformers/mapFiltersToDocumentSearchFilters';
import { mapColumnsToDocumentSortFields } from '../transformers/mapColumnsToDocumentSortFields';
import React from 'react';
import { DocumentSort } from 'app/domain/document/internal/types';

export const useObserveDocumentSearchFilters = ({
  column,
  order,
}: DocumentSort) => {
  const { setAppliedFilters } = useDocumentSearchFilters();
  const [query] = useQueryString(SEARCH_KEY);
  const [documentFilter] = useDocumentFilters();

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
      filter: transformFilter,
      sort: sort,
    });
  }, [query, setAppliedFilters, transformFilter, sort]);
};
