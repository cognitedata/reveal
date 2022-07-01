import { getMeasurementLogsData } from 'domain/wells/measurements0/service/network/getMeasurementLogsData';
import { groupBySequence } from 'domain/wells/wellbore/internal/transformers/groupBySequence';

import { DepthMeasurementData } from '@cognite/sdk-wells-v3';

import { WELL_QUERY_KEY } from 'constants/react-query';
import { useArrayCache } from 'hooks/useArrayCache';

export const useWellLogsRowDataQuery = (sequenceExternalIds: string[] = []) => {
  return useArrayCache<DepthMeasurementData>({
    /**
     * This key should not use sequenceExternalIds.
     * There is some issue which does not sends the request to fetch the well logs row data when new sequenceExternalIds are passed.
     * TODO: use WELL_QUERY_KEY.LOGS_ROW_DATA only
     */
    key: JSON.stringify([WELL_QUERY_KEY.LOGS_ROW_DATA, sequenceExternalIds]),
    items: new Set(sequenceExternalIds),
    fetchAction: (items: Set<string>, options) =>
      getMeasurementLogsData({ sequenceExternalIds: items, options }).then(
        groupBySequence
      ),
  });
};
