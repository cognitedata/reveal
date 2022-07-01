import { getMeasurementLogs } from 'domain/wells/measurements0/service/network/getMeasurementLogs';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import { DepthMeasurement } from '@cognite/sdk-wells-v3';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { useArrayCache } from 'hooks/useArrayCache';
import { WellboreId } from 'modules/wellSearch/types';

export const useWellLogsQuery = (wellboreIds: WellboreId[] = []) => {
  return useArrayCache<DepthMeasurement>({
    /**
     * This key should not use wellboreIds.
     * There is some issue which does not sends the request to fetch the well logs when new wellboreIds are passed.
     * TODO: use WELL_QUERY_KEY.LOGS only
     */
    key: JSON.stringify([WELL_QUERY_KEY.LOGS, wellboreIds]),
    items: new Set(wellboreIds),
    fetchAction: (items: Set<string>, options) =>
      getMeasurementLogs({ wellboreIds: items, options }).then(groupByWellbore),
  });
};
