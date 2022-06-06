import { NdsAggregate, NdsAggregateRow, Wellbore } from '@cognite/sdk-wells-v3';

import { NdsAggregatesInternal } from '../types';

export const normalizeNdsAggregates = (
  ndsAggregates: NdsAggregate[]
): NdsAggregatesInternal => {
  return ndsAggregates.reduce((ndsAggregatesMap, ndsAggregate) => {
    const { wellboreMatchingId, items } = ndsAggregate;
    return {
      ...ndsAggregatesMap,
      [wellboreMatchingId]: items,
    };
  }, {} as Record<Wellbore['matchingId'], NdsAggregateRow[]>);
};
