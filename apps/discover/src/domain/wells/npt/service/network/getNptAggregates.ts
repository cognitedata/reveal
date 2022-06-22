import { normalizeNptAggregates } from 'domain/wells/npt/internal/transformers/normalizeNptAggregates';
import { getWellSDKClient } from 'domain/wells/utils/authenticate';
import { convertToIdentifiers } from 'domain/wells/utils/convertToIdentifiers';

import {
  NptAggregate,
  NptAggregateEnum,
  Wellbore,
} from '@cognite/sdk-wells-v3';

export const getNptAggregates = (
  wellboreIds: Set<Wellbore['matchingId']>,
  groupBy: NptAggregateEnum[]
) => {
  return getWellSDKClient()
    .npt.aggregate({
      filter: {
        wellboreIds: convertToIdentifiers(wellboreIds),
      },
      groupBy,
    })
    .then((response) => response.items as NptAggregate[])
    .then(normalizeNptAggregates);
};
