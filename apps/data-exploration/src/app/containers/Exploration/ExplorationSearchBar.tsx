import React, { useState, useEffect } from 'react';

import styled from 'styled-components';

import debounce from 'lodash/debounce';

import { Input } from '@cognite/cogs.js';

import { EXPLORATION } from '@data-exploration-app/constants/metrics';
import { useQueryString } from '@data-exploration-app/hooks/hooks';
import { SEARCH_KEY } from '@data-exploration-app/utils/constants';
import { trackUsage } from '@data-exploration-app/utils/Metrics';
import { useTranslation } from '@data-exploration-lib/core';

export const ExplorationSearchBar = () => {
  const { t } = useTranslation();
  const [urlQuery, setUrlQuery] = useQueryString(SEARCH_KEY);
  const debouncedSetUrlQuery = debounce(setUrlQuery, 500);
  const [localQuery, setLocalQuery] = useState(urlQuery);

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
      placeholder={t(
        'EXPLORER_SEARCH_BAR_PLACEHOLDER',
        'Search for name, description, content, ID, external ID, and metadata...'
      )}
      onChange={handleOnChange}
      value={localQuery}
    />
  );
};

const StyledInput = styled(Input)`
  .cogs-input {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  .btn-reset {
    background: inherit !important;
  }
`;
