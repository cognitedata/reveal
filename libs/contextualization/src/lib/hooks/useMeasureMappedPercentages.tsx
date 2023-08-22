import { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';

import { POLLING_INTERVAL } from '../constants';
import { JobStatus } from '../types';

const useCreateMeasureMappedPercentages = (
  space: string,
  viewExternalId: string,
  viewVersion: string
) => {
  return useQuery({
    queryKey: [
      'context',
      'advancedjoins',
      'measuremappedpercentage',
      space,
      viewExternalId,
      viewVersion,
    ],
    queryFn: async () => {
      const response = await fetch(
        `https://localhost:8443/api/v1/projects/contextualization/advancedjoins/measuremappedpercentage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            space: space,
            viewExternalId: viewExternalId,
            viewVersion: viewVersion,
          }),
        }
      );

      return response.json();
    },
  });
};

const useGetMeasureMappedPercentages = (jobId: string | undefined) => {
  return useQuery({
    queryKey: ['context', 'advancedjoins', 'measuremappedpercentage', jobId],
    queryFn: async () => {
      const response = await fetch(
        `https://localhost:8443/api/v1/projects/contextualization/advancedjoins/measuremappedpercentage/${jobId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.json();
    },
    enabled: !!jobId,
  });
};

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
