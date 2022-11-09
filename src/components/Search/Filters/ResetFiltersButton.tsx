import React from 'react';
import { Button } from '@cognite/cogs.js';
import styled from 'styled-components';

export const ResetFiltersButton = <T extends Record<string, unknown>>({
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
