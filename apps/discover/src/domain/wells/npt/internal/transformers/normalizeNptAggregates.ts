import { NptAggregate, NptAggregateRow, Wellbore } from '@cognite/sdk-wells';

import { NptAggregatesInternal } from '../types';

export const normalizeNptAggregates = (
  nptAggregates: NptAggregate[]
): NptAggregatesInternal => {
  return nptAggregates.reduce((nptAggregatesMap, nptAggregate) => {
    const { wellboreMatchingId, items } = nptAggregate;
    return {
      ...nptAggregatesMap,
      [wellboreMatchingId]: items,
    };
  }, {} as Record<Wellbore['matchingId'], NptAggregateRow[]>);
};
