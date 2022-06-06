import { mergeNdsAggregates } from 'domain/wells/nds/internal/transformers/mergeNdsAggregates';
import { NdsAggregatesSummary } from 'domain/wells/nds/internal/types';

import { useQuery } from 'react-query';

import { NdsAggregateEnum } from '@cognite/sdk-wells-v3';

import { WELL_QUERY_KEY } from 'constants/react-query';

import { getNdsAggregates } from '../network/getNdsAggregates';

export const useNdsAggregatesSummaryQuery = (wellboreIds: string[]) => {
  const wellboreIdsSet = new Set(wellboreIds);

  return useQuery<NdsAggregatesSummary>(
    [...WELL_QUERY_KEY.NDS_EVENTS_AGGREGATE, ...wellboreIdsSet.keys()],
    async () => {
      const riskTypeAndSubtype = await getNdsAggregates(wellboreIdsSet, [
        NdsAggregateEnum.RiskType,
        NdsAggregateEnum.Subtype,
      ]);
      const severity = await getNdsAggregates(wellboreIdsSet, [
        NdsAggregateEnum.Severity,
      ]);
      const probability = await getNdsAggregates(wellboreIdsSet, [
        NdsAggregateEnum.Probability,
      ]);

      return Array.from(wellboreIdsSet).reduce((aggregatesMap, wellboreId) => {
        return {
          ...aggregatesMap,
          [wellboreId]: mergeNdsAggregates([
            ...riskTypeAndSubtype[wellboreId],
            ...severity[wellboreId],
            ...probability[wellboreId],
          ]),
        };
      }, {} as NdsAggregatesSummary);
    },
    {
      enabled: wellboreIdsSet.size > 0,
    }
  );
};
