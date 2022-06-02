import head from 'lodash/head';

import { NdsAggregate } from '@cognite/sdk-wells-v3';

import { NdsView } from '../types';

export const getNdsAggregateForWellbore = (
  data: NdsView[],
  ndsAggregates: Record<string, NdsAggregate>
) => {
  const wellboreMatchingId = head(data)?.wellboreMatchingId;

  if (!wellboreMatchingId) {
    return undefined;
  }
  return ndsAggregates[wellboreMatchingId];
};
