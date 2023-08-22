import { useEffect } from 'react';

import { POLLING_INTERVAL } from '../../constants';
import { JobStatus } from '../../types';

import { useCreateMeasureMappedPercentages } from './useCreateMeasureMappedPercentages';
import { useGetMeasureMappedPercentages } from './useGetMeasureMappedPercentages';

export const useMeasureMappedPercentages = (
  type: string,
  space: string,
  versionNumber: string,
  propertyName?: string
) => {
  const { data: { jobId } = {}, refetch: refreshMappedPercentages } =
    useCreateMeasureMappedPercentages(space, type, versionNumber);

  const {
    data: { status, properties } = {},
    refetch: refetchMappedPercentages,
  } = useGetMeasureMappedPercentages(jobId);

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

  const selectedProperty = properties?.find(
    (property: any) => property.propertyName === propertyName
  );
  return {
    mappedPercentageJobStatus: status || JobStatus.Queued,
    mappedPercentage: selectedProperty?.mappedPercentage,
    refreshMappedPercentages: refreshMappedPercentages,
  };
};
