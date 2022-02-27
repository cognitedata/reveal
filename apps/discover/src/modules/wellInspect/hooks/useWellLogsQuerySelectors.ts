import get from 'lodash/get';
import { getDateOrDefaultText } from 'utils/date';

import { useDeepMemo } from 'hooks/useDeep';
import { useWellInspectSelectedWellboreIds } from 'modules/wellInspect/hooks/useWellInspect';
import { WellLog } from 'pages/authorized/search/well/inspect/modules/logType/v3/types';

import {
  useWellInspectWellboreIdNameMap,
  useWellInspectWellboreWellIdMap,
  useWellInspectWellIdNameMap,
} from './useWellInspectIdMap';
import { useWellLogsQuery } from './useWellLogsQuery';

export const useSelectedWellboreLogs = () => {
  const wellboreIds = useWellInspectSelectedWellboreIds();
  const wellboreWellIdMap = useWellInspectWellboreWellIdMap();
  const wellIdNameMap = useWellInspectWellIdNameMap();
  const wellboreIdNameMap = useWellInspectWellboreIdNameMap();
  const { data: depthMeasurements, isLoading } = useWellLogsQuery(wellboreIds);

  return useDeepMemo(() => {
    if (!depthMeasurements) {
      return { data: [], isLoading };
    }

    const wellLogsData: WellLog[] = depthMeasurements.map(
      (depthMeasurement) => {
        const { source, wellboreMatchingId } = depthMeasurement;
        const wellId = get(wellboreWellIdMap, wellboreMatchingId, '');

        return {
          ...depthMeasurement,
          id: source.sequenceExternalId,
          wellName: get(wellIdNameMap, wellId, ''),
          wellboreName: get(wellboreIdNameMap, wellboreMatchingId, ''),
          modified: getDateOrDefaultText(new Date()),
        };
      }
    );

    return { data: wellLogsData, isLoading };
  }, [depthMeasurements, isLoading]);
};
