import compact from 'lodash/compact';
import get from 'lodash/get';
import { getDateOrDefaultText } from 'utils/date';

import { useDeepMemo } from 'hooks/useDeep';
import {
  useWellInspectSelectedWellboreIds,
  useWellInspectSelectedWells,
} from 'modules/wellInspect/hooks/useWellInspect';
import { WellLog } from 'pages/authorized/search/well/inspect/modules/logType/v3/types';

import { useWellLogsQuery } from './useWellLogsQuery';

export const useSelectedWellboreLogs = () => {
  const wells = useWellInspectSelectedWells();
  const wellboreIds = useWellInspectSelectedWellboreIds();
  const { data, isLoading } = useWellLogsQuery(wellboreIds);

  return useDeepMemo(() => {
    if (!data) {
      return { data: [], isLoading };
    }

    const wellLogsData: WellLog[] = compact(
      wells.flatMap((well) =>
        well.wellbores.map((wellbore) => {
          const depthMeasurement = get(data, wellbore.id);

          if (!depthMeasurement) return null;

          return {
            ...depthMeasurement,
            id: depthMeasurement.source.sequenceExternalId,
            wellName: well.name,
            wellboreName: wellbore.description || '',
            modified: getDateOrDefaultText(new Date()),
          };
        })
      )
    );

    return { data: wellLogsData, isLoading };
  }, [wellboreIds, data, isLoading]);
};
