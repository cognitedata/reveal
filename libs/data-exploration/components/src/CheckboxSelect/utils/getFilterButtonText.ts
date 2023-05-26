import isEmpty from 'lodash/isEmpty';

import { OptionSelection } from '../types';

export const getFilterButtonText = (selection: OptionSelection) => {
  if (isEmpty(selection)) {
    return 'Select...';
  }

  return `Selected: ${Object.keys(selection).length}`;
};
