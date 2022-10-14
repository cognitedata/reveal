import { useEffect } from 'react';
import { useDocumentFilters as useDocumentSearchFilters } from '@cognite/react-document-search';
import { useQueryString } from 'app/hooks/hooks';
import { SEARCH_KEY } from 'app/utils/constants';
import { useDocumentFilters } from 'app/store/filter/selectors/documentSelectors';
import { mapFiltersToDocumentSearchFilters } from '../transformers/mapFiltersToDocumentSearchFilters';
import React from 'react';

export const useObserveDocumentSearchFilters = () => {
  const [query] = useQueryString(SEARCH_KEY);
  const { setAppliedFilters } = useDocumentSearchFilters();
  const [documentFilter] = useDocumentFilters();

  const transformFilter = React.useMemo(
    () => mapFiltersToDocumentSearchFilters(documentFilter),
    [documentFilter]
  );

  useEffect(() => {
    setAppliedFilters({
      search: {
        query: query || '',
      },
      filter: transformFilter,
    });
  }, [query, setAppliedFilters, transformFilter]);
};
