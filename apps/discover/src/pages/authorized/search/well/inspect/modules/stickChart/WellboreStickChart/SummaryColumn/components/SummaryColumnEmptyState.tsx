import * as React from 'react';

import EmptyState from 'components/EmptyState';

import { EmptyStateWrapper } from '../../../../common/Events/elements';
import { LOADING_TEXT, EMPTY_SUMMARY_TEXT } from '../../constants';
import { SummaryColumnEmptyStateSpacer } from '../elements';

export interface SummaryColumnEmptyStateProps {
  isLoading?: boolean;
}

export const SummaryColumnEmptyState: React.FC<
  SummaryColumnEmptyStateProps
> = ({ isLoading }) => {
  return (
    <EmptyStateWrapper>
      <SummaryColumnEmptyStateSpacer />
      <EmptyState
        isLoading={isLoading}
        loadingSubtitle={isLoading ? LOADING_TEXT : ''}
        emptySubtitle={EMPTY_SUMMARY_TEXT}
        hideHeading
      />
    </EmptyStateWrapper>
  );
};
