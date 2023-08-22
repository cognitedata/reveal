import { useCallback, useEffect } from 'react';

import { POLLING_INTERVAL } from '../../constants';
import { JobStatus } from '../../types';

import { useCreateRunAdvancedJoin } from './useCreateRunAdvancedJoin';
import { useGetRunAdvancedJoin } from './useGetRunAdvancedJoin';

export const useRunAdvancedJoin = () => {
  const { data: { jobId } = {}, mutate } = useCreateRunAdvancedJoin();
  const { data: { status } = {}, refetch: refetchMappedPercentages } =
    useGetRunAdvancedJoin(jobId);

  const invokeRunJob = useCallback(
    (advancedJoinExternalId: string) => {
      mutate(advancedJoinExternalId);
    },
    [mutate]
  );

  // polling
  useEffect(() => {
    let pollJob: NodeJS.Timer | undefined;
    if (jobId) {
      pollJob = setInterval(() => {
        refetchMappedPercentages();
      }, POLLING_INTERVAL);
    }
    if (status === JobStatus.Completed || status === JobStatus.Failed) {
      clearInterval(pollJob);
    }
    return () => {
      clearInterval(pollJob);
    };
  }, [jobId, refetchMappedPercentages, status]);

  return {
    runAdvancedJoinJobStatus: status || JobStatus.Queued,
    invokeRunJob,
  };
};
