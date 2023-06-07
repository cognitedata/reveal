import React from 'react';

import { makeDefaultTranslations } from 'utils/translations';
import { EmptyStateContainer, EmptyStateTitle, EmptyStateText } from './styles';

const defaultTranslations = makeDefaultTranslations(
  'All public charts will show up here',
  'You can make your chart public by clicking on the share button in the menu.'
);

type Props = {
  translations?: typeof defaultTranslations;
};

const EmptyStatePublicCharts = ({ translations }: Props) => {
  const t = { ...defaultTranslations, ...translations };
  return (
    <EmptyStateContainer>
      <EmptyStateTitle level={3}>
        {t['All public charts will show up here']}
      </EmptyStateTitle>
      <EmptyStateText>
        {
          t[
            'You can make your chart public by clicking on the share button in the menu.'
          ]
        }
      </EmptyStateText>
    </EmptyStateContainer>
  );
};

export default EmptyStatePublicCharts;
