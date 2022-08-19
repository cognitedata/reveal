import * as React from 'react';

import EmptyState from 'components/EmptyState';

import { EmptyStateContainer, NoDataContainer } from './elements';

export const NoDataAvailable: React.FC = React.memo(() => {
  return (
    <NoDataContainer>
      <EmptyStateContainer>
        <EmptyState />
      </EmptyStateContainer>
    </NoDataContainer>
  );
});
