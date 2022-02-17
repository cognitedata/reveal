import { DepthMeasurementData } from '@cognite/sdk-wells-v3';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { useArrayCache } from 'hooks/useArrayCache';
import { fetchAllWellLogsRowData } from 'modules/wellSearch/service/measurements/wellLogs';
import {
  groupBySource,
  keyBySource,
} from 'modules/wellSearch/utils/groupBySource';

export const useWellLogsRowDataQuery = (sequenceExternalIds: string[] = []) => {
  const { data, ...rest } = useArrayCache<DepthMeasurementData>({
    /**
     * This key should not use sequenceExternalIds.
     * There is some issue which does not sends the request to fetch the well logs row data when new sequenceExternalIds are passed.
     * TODO: use WELL_QUERY_KEY.LOGS_ROW_DATA only
     */
    key: JSON.stringify([WELL_QUERY_KEY.LOGS_ROW_DATA, sequenceExternalIds]),
    items: new Set(sequenceExternalIds),
    fetchAction: (items: Set<string>, options) =>
      fetchAllWellLogsRowData({ sequenceExternalIds: items, options }).then(
        groupBySource
      ),
  });

  return {
    ...rest,
    data: data ? keyBySource(data) : {},
  };
};
