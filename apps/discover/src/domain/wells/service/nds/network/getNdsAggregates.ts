import { normalizeNdsAggregates } from 'domain/wells/dataLayer/nds/adapters/normalizeNdsAggregates';
import { getWellSDKClient } from 'domain/wells/utils/authenticate';
import { convertToIdentifiers } from 'domain/wells/utils/convertToIdentifiers';

import {
  NdsAggregate,
  NdsAggregateEnum,
  Wellbore,
} from '@cognite/sdk-wells-v3';

export const getNdsAggregates = (
  wellboreIds: Set<Wellbore['matchingId']>,
  groupBy: NdsAggregateEnum[]
) => {
  return getWellSDKClient()
    .nds.aggregate({
      filter: {
        wellboreIds: convertToIdentifiers(wellboreIds),
      },
      groupBy,
    })
    .then((response) => response.items as NdsAggregate[])
    .then(normalizeNdsAggregates);
};
