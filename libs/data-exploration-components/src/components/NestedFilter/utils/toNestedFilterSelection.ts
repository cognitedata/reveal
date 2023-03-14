import { EMPTY_ARRAY } from '@data-exploration-lib/core';

import { NestedFilterSelection } from '../types';

export const toNestedFilterSelection = (
  values: string[]
): NestedFilterSelection => {
  return values.reduce(
    (selection, value) => ({
      ...selection,
      [value]: EMPTY_ARRAY,
    }),
    {} as NestedFilterSelection
  );
};
