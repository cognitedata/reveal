import isEmpty from 'lodash/isEmpty';

import { WellFilterMapValue } from '../types';

/*
 * This checks whether the parent should be updated or not.
 */

export const isParentShouldUpdate = (
  selectedValues: WellFilterMapValue,
  updatingValues: string[]
) => {
  if (!updatingValues || !Array.isArray(updatingValues)) {
    return false;
  }

  if (!selectedValues) {
    return true;
  }

  return !isEmpty(
    updatingValues.find((value) => !selectedValues.includes(value))
  );
};
