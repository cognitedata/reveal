import get from 'lodash/get';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import set from 'lodash/set';

import { MultiSelect } from 'modules/inspectTabs/types';

export const convertToClosestInteger = <Item>(
  event: Item,
  accessors: string[]
) => {
  const copiedEvent = { ...event };
  accessors.forEach((accessor) => {
    const numValue = Number(get(event, accessor));
    if (Number.isNaN(numValue)) {
      set(copiedEvent as unknown as Record<string, unknown>, accessor, '');
    } else {
      set(
        copiedEvent as unknown as Record<string, unknown>,
        accessor,
        numValue.toFixed(0)
      );
    }
  });
  return copiedEvent;
};

export const hasCategoryFilterFulfilled = <Item>(
  event: Item,
  filterCategory: string,
  list: MultiSelect
) => {
  return !isEmpty(list) && includes(list, get(event, filterCategory));
};
