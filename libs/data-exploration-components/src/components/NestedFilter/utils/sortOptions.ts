import orderBy from 'lodash/orderBy';

import { OptionType, SortDirection } from '../types';

export const sortOptions = <T extends Pick<OptionType, 'label' | 'value'>>(
  options: T[],
  sortDirection?: SortDirection
) => {
  return orderBy(
    options,
    ({ label, value }) => {
      return label || value;
    },
    sortDirection
  );
};
