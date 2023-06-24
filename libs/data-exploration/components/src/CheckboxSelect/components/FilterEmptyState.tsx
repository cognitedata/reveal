import * as React from 'react';

import { useTranslation } from '@data-exploration-lib/core';

import { EmptyStateText } from '../elements';

export interface FilterEmptyStateProps {
  text?: string;
}

// TODO: Change the layout of the empty state
export const FilterEmptyState: React.FC<FilterEmptyStateProps> = ({ text }) => {
  const { t } = useTranslation();
  return (
    <EmptyStateText>{text || t('NO_OPTIONS', 'No options')}</EmptyStateText>
  );
};
