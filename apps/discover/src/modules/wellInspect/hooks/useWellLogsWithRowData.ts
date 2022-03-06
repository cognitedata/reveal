import { DepthMeasurement, DepthMeasurementData } from '@cognite/sdk-wells-v3';

import { useDeepMemo } from 'hooks/useDeep';

import { useSelectedWellboreLogs } from './useWellLogsQuerySelectors';
import { useWellLogsRowDataQuery } from './useWellLogsRowDataQuery';

export const useWellLogsWithRowData = (): {
  wellLogs: DepthMeasurement[];
  wellLogsRowData: DepthMeasurementData[];
  isLoading: boolean;
} => {
  const { data: wellLogs, isLoading: isWellLogsLoading } =
    useSelectedWellboreLogs();

  const sequenceExternalIds = useDeepMemo(() => {
    if (!wellLogs) {
      return [];
    }
    return wellLogs.map(
      (depthMeasurement) => depthMeasurement.source.sequenceExternalId
    );
  }, [wellLogs]);

  const { data: wellLogsRowData, isLoading: isWellLogsRowDataLoading } =
    useWellLogsRowDataQuery(sequenceExternalIds);

  const isLoading = isWellLogsLoading || isWellLogsRowDataLoading;

  return useDeepMemo(() => {
    if (!wellLogs || !wellLogsRowData) {
      return {
        wellLogs: [],
        wellLogsRowData: [],
        isLoading,
      };
    }

    return {
      wellLogs,
      wellLogsRowData,
      isLoading,
    };
  }, [wellLogs, wellLogsRowData, isLoading]);
};
