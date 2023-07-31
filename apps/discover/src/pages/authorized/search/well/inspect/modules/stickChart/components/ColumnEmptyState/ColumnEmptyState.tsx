import * as React from 'react';

import EmptyState from 'components/EmptyState';

import { EmptyStateWrapper } from '../../../common/Events/elements';
import { LOADING_TEXT, NO_DATA_TEXT } from '../../WellboreStickChart/constants';

export interface ColumnEmptyStateProps {
  isLoading?: boolean;
  emptySubtitle?: string;
}

export const ColumnEmptyState: React.FC<ColumnEmptyStateProps> = ({
  isLoading = false,
  emptySubtitle,
}) => {
  return (
    <EmptyStateWrapper>
      <EmptyState
        isLoading={isLoading}
        loadingSubtitle={isLoading ? LOADING_TEXT : ''}
        emptySubtitle={emptySubtitle || NO_DATA_TEXT}
        hideHeading
      />
    </EmptyStateWrapper>
  );
};
