import { mergeNdsAggregates } from 'domain/wells/nds/internal/transformers/mergeNdsAggregates';
import { NdsAggregatesSummary } from 'domain/wells/nds/internal/types';

import { useQuery } from 'react-query';

import { NdsAggregateEnum } from '@cognite/sdk-wells';

import { WELL_QUERY_KEY } from 'constants/react-query';

import { getNdsAggregates } from '../../service/network/getNdsAggregates';

export const useNdsAggregatesSummaryQuery = (wellboreIds: string[]) => {
  const wellboreIdsSet = new Set(wellboreIds);

  return useQuery<NdsAggregatesSummary>(
    [...WELL_QUERY_KEY.NDS_EVENTS_AGGREGATE, ...wellboreIdsSet.keys()],
    async () => {
      const aggregates = await getNdsAggregates(wellboreIdsSet, [
        NdsAggregateEnum.RiskType,
        NdsAggregateEnum.Subtype,
        NdsAggregateEnum.Severity,
        NdsAggregateEnum.Probability,
      ]);

      return Array.from(wellboreIdsSet).reduce((aggregatesMap, wellboreId) => {
        return {
          ...aggregatesMap,
          [wellboreId]: mergeNdsAggregates(aggregates[wellboreId]),
        };
      }, {} as NdsAggregatesSummary);
    },
    {
      enabled: wellboreIdsSet.size > 0,
    }
  );
};
