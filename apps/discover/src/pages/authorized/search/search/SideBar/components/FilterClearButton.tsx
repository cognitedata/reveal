import React from 'react';

import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { useFilterAppliedFilters } from 'modules/sidebar/selectors';
import { AppliedFiltersType, CategoryTypes } from 'modules/sidebar/types';

import { ClearButton } from './elements';

export interface Props {
  category: Exclude<CategoryTypes, 'landing'>;
  displayClear?: boolean;
  handleClearFilters?: () => void;
}

export const FilterClearButton: React.FC<Props> = React.memo(
  ({ category, displayClear, handleClearFilters }) => {
    const appliedFilters: AppliedFiltersType = useFilterAppliedFilters();
    const metrics = useGlobalMetrics('search');

    const handleClickClearButton = () => {
      metrics.track('click-clear-button');
      if (handleClearFilters) {
        handleClearFilters();
      }
    };

    const hasSomeFiltersApplied =
      appliedFilters[category] &&
      Object.values(appliedFilters[category]).some((item) => item.length > 0);

    if (!displayClear || !hasSomeFiltersApplied) {
      return null;
    }

    return (
      <ClearButton
        data-testid="clear-button"
        type="ghost-danger"
        aria-label="Clear"
        onClick={handleClickClearButton}
      >
        Clear
      </ClearButton>
    );
  }
);
