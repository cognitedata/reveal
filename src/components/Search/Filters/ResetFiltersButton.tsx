import React from 'react';
import { Button } from '@cognite/cogs.js';
import styled from 'styled-components';
import { FiltersType } from 'CommonProps';

export const ResetFiltersButton = <T extends FiltersType>({
  setFilter,
}: {
  setFilter: (filter: T) => void;
}) => {
  const handleResetFilters = () => {
    setFilter({} as T);
  };
  return (
    <StyledButton onClick={handleResetFilters} type="secondary" icon="Restore">
      Reset all filters
    </StyledButton>
  );
};

const StyledButton = styled(Button)`
  width: 100%;
`;
