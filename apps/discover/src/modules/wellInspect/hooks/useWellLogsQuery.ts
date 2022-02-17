import { DepthMeasurement } from '@cognite/sdk-wells-v3';

import { EMPTY_OBJECT } from 'constants/empty';
import { WELL_QUERY_KEY } from 'constants/react-query';
import { useArrayCache } from 'hooks/useArrayCache';
import { fetchAllSequences } from 'modules/wellSearch/service/measurements/wellLogs';
import { WellboreId } from 'modules/wellSearch/types';
import {
  groupByWellbore,
  keyByWellbore,
} from 'modules/wellSearch/utils/groupByWellbore';

export const useWellLogsQuery = (wellboreIds: WellboreId[] = []) => {
  const { data, ...rest } = useArrayCache<DepthMeasurement>({
    /**
     * This key should not use wellboreIds.
     * There is some issue which does not sends the request to fetch the well logs when new wellboreIds are passed.
     * TODO: use WELL_QUERY_KEY.LOGS only
     */
    key: JSON.stringify([WELL_QUERY_KEY.LOGS, wellboreIds]),
    items: new Set(wellboreIds),
    fetchAction: (items: Set<string>, options) =>
      fetchAllSequences({ wellboreIds: items, options }).then(groupByWellbore),
  });

  return {
    ...rest,
    data: data
      ? keyByWellbore(data)
      : (EMPTY_OBJECT as Record<WellboreId, DepthMeasurement>),
  };
};
