import { WellboreDataLayer } from 'domain/wells/dataLayer/wellbore/types';
import { useNdsEventsQuery } from 'domain/wells/service/nds/queries/useNdsEventsQuery';
import { useNdsTvdDataQuery } from 'domain/wells/service/nds/queries/useNdsTvdDataQuery';

import keyBy from 'lodash/keyBy';

import { useDeepMemo } from 'hooks/useDeep';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import {
  useWellInspectSelectedWellboreIds,
  useWellInspectSelectedWellbores,
} from 'modules/wellInspect/hooks/useWellInspect';

import { processNdsData } from './utils/processNdsData';

export const useNdsData = () => {
  const wellbores = useWellInspectSelectedWellbores();
  const wellboreIds = useWellInspectSelectedWellboreIds();
  const wellboreMatchingIdMap = keyBy(wellbores, 'matchingId');
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

  const { data: ndsData, ...rest } = useNdsEventsQuery({
    wellboreIds: new Set(wellboreIds),
  });

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
    data: processedData,
    ...rest,
  };
};
