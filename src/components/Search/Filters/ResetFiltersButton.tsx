import React from 'react';
import { Button } from '@cognite/cogs.js';
import styled from 'styled-components';
import {
  AssetFilterProps,
  TimeseriesFilter,
  FileFilterProps,
  EventFilter,
  SequenceFilter,
} from '@cognite/sdk';

type ResourceFiltersType =
  | FileFilterProps
  | AssetFilterProps
  | EventFilter
  | TimeseriesFilter
  | Required<SequenceFilter>['filter'];

export const ResetFiltersButton = <T extends ResourceFiltersType>({
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
