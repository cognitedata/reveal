import * as React from 'react';

import EmptyState from 'components/EmptyState';

import { EmptyStateWrapper } from '../../common/Events/elements';

import { NO_COLUMNS_SELECTED_TEXT } from './constants';
import { WellboreStickChartEmptyStateWrapper } from './elements';

export interface WellboreStickChartEmptyStateProps {
  isAnyColumnVisible: boolean;
}

export const WellboreStickChartEmptyState: React.FC<
  WellboreStickChartEmptyStateProps
> = ({ isAnyColumnVisible }) => {
  if (isAnyColumnVisible) {
    return null;
  }

  return (
    <WellboreStickChartEmptyStateWrapper>
      <EmptyStateWrapper>
        <EmptyState hideHeading emptySubtitle={NO_COLUMNS_SELECTED_TEXT} />
      </EmptyStateWrapper>
    </WellboreStickChartEmptyStateWrapper>
  );
};
