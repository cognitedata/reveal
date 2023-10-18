import React from 'react';

import styled from 'styled-components';

import debounce from 'lodash/debounce';

import { Input } from '@cognite/cogs.js';

import { useDebouncedQuery, useTranslation } from '@data-exploration-lib/core';

import { EXPLORATION } from '../../constants/metrics';
import { useQueryString } from '../../hooks/hooks';
import { SEARCH_KEY } from '../../utils/constants';
import { trackUsage } from '../../utils/Metrics';

export const ExplorationSearchBar = () => {
  const { t } = useTranslation();
  const [urlQuery, setUrlQuery] = useQueryString(SEARCH_KEY);
  const [localQuery, setLocalQuery] = useDebouncedQuery<string>(
    (newValue) => setUrlQuery(newValue || ''),
    urlQuery
  );

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
      data-testid="main-search-input"
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
