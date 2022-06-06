import { WellboreDataLayer } from 'domain/wells/dataLayer/wellbore/types';
import { useNdsAggregatesSummaryQuery } from 'domain/wells/nds/service/queries/useNdsAggregatesSummaryQuery';
import { useNdsEventsQuery } from 'domain/wells/nds/service/queries/useNdsEventsQuery';
import { useNdsTvdDataQuery } from 'domain/wells/nds/service/queries/useNdsTvdDataQuery';
import { useWellInspectSelectedWellboreIds } from 'domain/wells/well/internal/transformers/useWellInspectSelectedWellboreIds';
import { useWellInspectSelectedWellbores } from 'domain/wells/well/internal/transformers/useWellInspectSelectedWellbores';

import keyBy from 'lodash/keyBy';

import { useDeepMemo } from 'hooks/useDeep';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { processNdsData } from './utils/processNdsData';

export const useNdsData = () => {
  const wellbores = useWellInspectSelectedWellbores();
  const wellboreIds = useWellInspectSelectedWellboreIds();
  const wellboreMatchingIdMap = keyBy(wellbores, 'matchingId');
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

  const { data: ndsData, isLoading } = useNdsEventsQuery({
    wellboreIds: new Set(wellboreIds),
  });
  const { data: ndsAggregates } = useNdsAggregatesSummaryQuery(wellboreIds);

  const originalNdsData = useDeepMemo(() => {
    if (!ndsData) {
      return [];
    }
    return ndsData.map(({ original }) => original);
  }, [ndsData]);

  const { data: tvdData } = useNdsTvdDataQuery(originalNdsData);

  const processedData = useDeepMemo(() => {
    if (!ndsData) {
      return [];
    }

    return ndsData.map((nds) => {
      const { wellboreMatchingId } = nds;
      const wellbore = wellboreMatchingIdMap[wellboreMatchingId];

      return processNdsData(
        nds,
        wellbore as WellboreDataLayer, // Remove the cast when refactored
        tvdData[wellboreMatchingId]
      );
    });
  }, [ndsData, tvdData, userPreferredUnit]);

  return {
    isLoading,
    data: processedData,
    ndsAggregates: ndsAggregates || {},
  };
};
