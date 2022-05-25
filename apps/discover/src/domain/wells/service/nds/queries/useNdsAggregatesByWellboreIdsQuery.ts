import { convertToIdentifiers } from 'domain/wells/utils/convertToIdentifiers';

import { useQuery } from 'react-query';

import { getWellSDKClient } from 'services/wellSearch/sdk';

import { NdsAggregate, NdsAggregateEnum } from '@cognite/sdk-wells-v3';

import { WELL_QUERY_KEY } from 'constants/react-query';

export const useNdsAggregatesByWellboreIdsQuery = (wellboreIds: string[]) => {
  const wellboreIdsSet = new Set(wellboreIds);
  return useQuery<NdsAggregate[]>(
    [...WELL_QUERY_KEY.NDS_EVENTS_AGGREGATE, ...wellboreIdsSet.keys()],
    () => {
      return getWellSDKClient()
        .nds.aggregate({
          filter: {
            wellboreIds: convertToIdentifiers(wellboreIdsSet),
          },
          groupBy: [NdsAggregateEnum.RiskType, NdsAggregateEnum.Subtype],
        })
        .then((response) => response.items);
    },
    {
      enabled: wellboreIdsSet.size > 0,
    }
  );
};
