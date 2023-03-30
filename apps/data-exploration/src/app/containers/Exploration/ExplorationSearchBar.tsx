import React, { useState, useEffect } from 'react';
import { Input } from '@cognite/cogs.js';
import debounce from 'lodash/debounce';
import { useQueryString } from '@data-exploration-app/hooks/hooks';
import { SEARCH_KEY } from '@data-exploration-app/utils/constants';
import { trackUsage } from '@data-exploration-app/utils/Metrics';
import { EXPLORATION } from '@data-exploration-app/constants/metrics';
import styled from 'styled-components';
import { useFlagAdvancedFilters } from '@data-exploration-app/hooks/flags/useFlagAdvancedFilters';

export const ExplorationSearchBar = () => {
  const [urlQuery, setUrlQuery] = useQueryString(SEARCH_KEY);
  const debouncedSetUrlQuery = debounce(setUrlQuery, 300);
  const [localQuery, setLocalQuery] = useState(urlQuery);
  const isAdvancedFiltersEnabled = useFlagAdvancedFilters();

  useEffect(() => {
    if (localQuery !== urlQuery) {
      debouncedSetUrlQuery(localQuery);
    }
    return () => debouncedSetUrlQuery.cancel();
  }, [debouncedSetUrlQuery, localQuery, urlQuery]);

  const track = debounce((value: string) => {
    trackUsage(EXPLORATION.SEARCH.GLOBAL, { query: value });
  }, 500);

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQuery(event.target.value);
    track(event.target.value);
  };

  return (
    <StyledInput
      size="large"
      variant="noBorder"
      autoFocus
      fullWidth
      clearable={{ callback: () => setLocalQuery('') }}
      icon="Search"
      placeholder={
        isAdvancedFiltersEnabled
          ? 'Search for name, description, content, ID, and external ID...'
          : 'Search...'
      }
      onChange={handleOnChange}
      value={localQuery}
    />
  );
};

const StyledInput = styled(Input)`
  .btn-reset {
    background: inherit !important;
  }
`;
