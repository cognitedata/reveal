import React from 'react';
import { Button } from '@cognite/cogs.js';
import styled from 'styled-components';
import { FiltersType } from '@cognite/data-exploration';

export const ResetFiltersButton = <T extends FiltersType>({
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
      variant="inverted"
      icon="Restore"
      size="default"
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
