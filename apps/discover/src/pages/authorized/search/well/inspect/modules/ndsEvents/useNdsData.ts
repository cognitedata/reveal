import { keyByWellbore } from 'domain/wells/dataLayer/wellbore/adapters/keyByWellbore';
import { WellboreDataLayer } from 'domain/wells/dataLayer/wellbore/types';
import { useNdsAggregatesByWellboreIdsQuery } from 'domain/wells/service/nds/queries/useNdsAggregatesByWellboreIdsQuery';
import { useNdsEventsQuery } from 'domain/wells/service/nds/queries/useNdsEventsQuery';
import { useNdsTvdDataQuery } from 'domain/wells/service/nds/queries/useNdsTvdDataQuery';
import { useWellInspectSelectedWellboreIds } from 'domain/wells/well/internal/transformers/useWellInspectSelectedWellboreIds';
import { useWellInspectSelectedWellbores } from 'domain/wells/well/internal/transformers/useWellInspectSelectedWellbores';

import keyBy from 'lodash/keyBy';

import { useDeepMemo } from 'hooks/useDeep';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { generateNdsFilterDataFromAggregate } from './utils/generateNdsFilterDataFromAggregate';
import { processNdsData } from './utils/processNdsData';

export const useNdsData = () => {
  const wellbores = useWellInspectSelectedWellbores();
  const wellboreIds = useWellInspectSelectedWellboreIds();
  const wellboreMatchingIdMap = keyBy(wellbores, 'matchingId');
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

  const { data: ndsData, isLoading } = useNdsEventsQuery({
    wellboreIds: new Set(wellboreIds),
  });
  const { data: ndsAggregates } =
    useNdsAggregatesByWellboreIdsQuery(wellboreIds);

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

  const riskTypeFilters = useDeepMemo(
    () => generateNdsFilterDataFromAggregate(ndsAggregates || []),
    [ndsAggregates]
  );

  return {
    isLoading,
    data: processedData,
    ndsAggregates: keyByWellbore(ndsAggregates || []),
    riskTypeFilters,
  };
};
