import { useNdsAggregatesSummaryQuery } from 'domain/wells/nds/internal/queries/useNdsAggregatesSummaryQuery';
import { useNdsEventsQuery } from 'domain/wells/nds/internal/queries/useNdsEventsQuery';
import { useNdsTvdDataQuery } from 'domain/wells/nds/internal/queries/useNdsTvdDataQuery';
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
    wellboreIds,
  });

  const { data: ndsAggregates } = useNdsAggregatesSummaryQuery(wellboreIds);

  const originalNdsData = useDeepMemo(() => {
    if (!ndsData) {
      return [];
    }
    return ndsData.map(({ original }) => original);
  }, [ndsData]);

  const { data: tvdData, isLoading: isTvdLoading } =
    useNdsTvdDataQuery(originalNdsData);

  const processedData = useDeepMemo(() => {
    if (!ndsData) {
      return [];
    }

    return ndsData.map((nds) => {
      const { wellboreMatchingId } = nds;
      const wellbore = wellboreMatchingIdMap[wellboreMatchingId];

      return processNdsData(nds, wellbore, tvdData[wellboreMatchingId]);
    });
  }, [ndsData, tvdData, userPreferredUnit]);

  return {
    isLoading: isLoading || isTvdLoading,
    data: processedData,
    ndsAggregates: ndsAggregates || {},
  };
};
