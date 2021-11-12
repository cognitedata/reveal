import React from 'react';

import { useTranslation } from '@cognite/react-i18n';

import EmptyState from 'components/emptyState';

import { NO_DATA_AVAILABLE_TEXT } from './constants';
import { EmptyStateContainer, NoDataContainer } from './elements';

export const NoDataAvailable: React.FC = React.memo(() => {
  const { t } = useTranslation();

  return (
    <NoDataContainer>
      <EmptyStateContainer>
        <EmptyState emptySubtitle={t(NO_DATA_AVAILABLE_TEXT)} />
      </EmptyStateContainer>
    </NoDataContainer>
  );
});
