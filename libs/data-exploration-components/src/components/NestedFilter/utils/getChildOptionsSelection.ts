import { EMPTY_OBJECT } from '@data-exploration-lib/core';

import map from 'lodash/map';
import isEmpty from 'lodash/isEmpty';

import { NestedFilterSelection, ChildOptionType } from '../types';

import { toNestedFilterSelection } from './toNestedFilterSelection';

export const getChildOptionsSelection = (
  childOptions: ChildOptionType[],
  childOptionsValues?: string[]
): NestedFilterSelection => {
  if (!childOptionsValues) {
    return EMPTY_OBJECT;
  }

  if (isEmpty(childOptionsValues)) {
    const allChildOptionsValues = map(childOptions, 'value');
    return toNestedFilterSelection(allChildOptionsValues);
  }

  return toNestedFilterSelection(childOptionsValues);
};
