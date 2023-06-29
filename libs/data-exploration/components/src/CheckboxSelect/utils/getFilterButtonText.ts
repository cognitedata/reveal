import isEmpty from 'lodash/isEmpty';

import { TFunction } from '@data-exploration-lib/core';

import { OptionSelection } from '../types';

export const getFilterButtonText = (
  selection: OptionSelection,
  t: TFunction
) => {
  if (isEmpty(selection)) {
    return t('SELECT_PLACEHOLDER', 'Select...');
  }

  const selectedCount = Object.keys(selection).length;

  return t('SELECTED_COUNT', `Selected: ${selectedCount}`, {
    count: selectedCount,
  });
};
