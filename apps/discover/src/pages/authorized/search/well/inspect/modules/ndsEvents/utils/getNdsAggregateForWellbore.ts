import {
  NdsAggregatesSummary,
  WellboreNdsAggregatesSummary,
} from 'domain/wells/nds/internal/types';
import { getEmptyNdsAggregatesMerged } from 'domain/wells/nds/internal/utils/getEmptyNdsAggregatesMerged';

import head from 'lodash/head';

import { NdsView } from '../types';

export const getNdsAggregateForWellbore = (
  data: NdsView[],
  ndsAggregates: NdsAggregatesSummary
): WellboreNdsAggregatesSummary => {
  const wellboreMatchingId = head(data)?.wellboreMatchingId;

  if (!wellboreMatchingId) {
    return getEmptyNdsAggregatesMerged();
  }
  return ndsAggregates[wellboreMatchingId];
};
