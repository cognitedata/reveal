import React from 'react';

import { makeDefaultTranslations } from 'utils/translations';
import { EmptyStateContainer, EmptyStateTitle, EmptyStateText } from './styles';

const defaultTranslations = makeDefaultTranslations(
  'Create a new chart to get started',
  'You can also check out public charts in the left menu.'
);

const EmptyStateMyCharts = () => {
  const t = defaultTranslations;
  return (
    <EmptyStateContainer>
      <EmptyStateTitle level={3}>
        {t['Create a new chart to get started']}
      </EmptyStateTitle>
      <EmptyStateText>
        {t['You can also check out public charts in the left menu.']}
      </EmptyStateText>
    </EmptyStateContainer>
  );
};

export default EmptyStateMyCharts;
