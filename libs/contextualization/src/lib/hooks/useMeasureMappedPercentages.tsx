import { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import { POLLING_INTERVAL } from '../constants';
import { JobStatus } from '../types';

const useCreateMeasureMappedPercentages = (
  space: string,
  viewExternalId: string,
  viewVersion: string
) => {
  const sdk = useSDK();

  return useQuery({
    queryKey: [
      'advancedjoins',
      'measuremappedpercentage',
      space,
      viewExternalId,
      viewVersion,
    ],
    queryFn: async () => {
      const response = await sdk.post(
        `/api/v1/projects/${sdk.project}/advancedjoins/measuremappedpercentage`,
        {
          headers: {
            'cdf-version': 'alpha',
            'Content-Type': 'application/json',
          },
          data: {
            space: space,
            viewExternalId: viewExternalId,
            viewVersion: viewVersion,
          },
        }
      );

      return response.data;
    },
    enabled: !!space && !!viewExternalId && !!viewVersion,
  });
};

const useGetMeasureMappedPercentages = (jobId: string | undefined) => {
  const sdk = useSDK();

  return useQuery({
    queryKey: ['advancedjoins', 'measuremappedpercentage', jobId],
    queryFn: async () => {
      const response = await sdk.get(
        `/api/v1/projects/${sdk.project}/advancedjoins/measuremappedpercentage/${jobId}`,
        {
          headers: {
            'cdf-version': 'alpha',
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
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
