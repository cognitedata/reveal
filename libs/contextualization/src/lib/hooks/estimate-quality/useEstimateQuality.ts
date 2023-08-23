import { useEffect } from 'react';

import { POLLING_INTERVAL } from '../../constants';
import { JobStatus } from '../../types';

import { useCreateEstimateQuality } from './useCreateEstimateQuality';
import { useGetEstimateQuality } from './useGetEstimateQuality';

export const useEstimateQuality = (
  advancedJoinExternalId: string,
  selectedDatabase: string,
  selectedTable: string,
  fromColumn: string | undefined,
  toColumn: string | undefined
) => {
  const { data: { jobId } = {} } = useCreateEstimateQuality(
    advancedJoinExternalId,
    selectedDatabase,
    selectedTable,
    fromColumn,
    toColumn
  );

  const {
    data: {
      status,
      qualityScorePercent,
      confidencePercent,
      contextualizationScorePercent,
    } = {},
    refetch: refetchMappedPercentages,
  } = useGetEstimateQuality(jobId);

  // polling
  useEffect(() => {
    let pollMeasureMappedPercentages: NodeJS.Timer | undefined;

    if (jobId) {
      pollMeasureMappedPercentages = setInterval(() => {
        refetchMappedPercentages();
      }, POLLING_INTERVAL);
    }

    if (status === JobStatus.Completed || status === JobStatus.Failed) {
      clearInterval(pollMeasureMappedPercentages);
    }

    return () => {
      clearInterval(pollMeasureMappedPercentages);
    };
  }, [jobId, refetchMappedPercentages, status]);

  return {
    estimateQualityJobStatus: status || JobStatus.Queued,
    qualityScorePercent,
    mappedPercentage: 50,
    confidencePercent,
    contextualizationScorePercent,
  };
};
