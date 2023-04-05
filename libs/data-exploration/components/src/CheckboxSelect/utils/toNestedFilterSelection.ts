import { EMPTY_ARRAY } from '@data-exploration-lib/core';

import { OptionSelection } from '../types';

export const toNestedFilterSelection = (values: string[]): OptionSelection => {
  return values.reduce(
    (selection, value) => ({
      ...selection,
      [value]: EMPTY_ARRAY,
    }),
    {} as OptionSelection
  );
};
