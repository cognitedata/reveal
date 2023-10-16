import React from 'react';

import styled from 'styled-components';

import { Button } from '@cognite/cogs.js';

import { InternalFilters } from '@data-exploration-lib/core';

export const ResetFiltersButton = <T extends InternalFilters>({
  setFilter,
}: {
  setFilter: (filter: T) => void;
}) => {
  const handleResetFilters = () => {
    setFilter({} as T);
  };
  return (
    <StyledButton
      onClick={handleResetFilters}
      type="tertiary"
      inverted
      icon="Restore"
      size="medium"
    >
      Reset filters
    </StyledButton>
  );
};

const StyledButton = styled(Button).attrs({ className: 'z-4' })`
  width: 100%;
  position: sticky;
  bottom: 16px;
  min-height: 36px;
`;
