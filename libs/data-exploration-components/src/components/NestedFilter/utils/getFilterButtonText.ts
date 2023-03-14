import isEmpty from 'lodash/isEmpty';
import { NestedFilterSelection } from '../types';

export const getFilterButtonText = (selection: NestedFilterSelection) => {
  if (isEmpty(selection)) {
    return 'Select...';
  }

  return `Selected: ${Object.keys(selection).length}`;
};
