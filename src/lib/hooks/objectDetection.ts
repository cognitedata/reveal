import { v4 as uuid } from 'uuid';
import { useMutation, useQuery } from 'react-query';
import { useContext, useState } from 'react';
import { ModelStatus } from 'lib/types';
import { useSDK } from '@cognite/sdk-provider';
import { AnnotationBoundingBox } from '@cognite/annotations';
import { FileContextualizationContext } from 'lib/context/FileContextualization';

export type ObjectDetectionEntity = {
  id: string;
  type: string;
  score?: number;
  boundingBox: { xMin: number; xMax: number; yMin: number; yMax: number };
};

type Job = {
  jobId?: number;
  status?: ModelStatus;
  annotations?: ObjectDetectionEntity[];
};

export const useFindObjectsJobId = (fileId: number): number | undefined => {
  const { getId } = useContext(FileContextualizationContext) || {};

  if (getId) {
    return getId(fileId, 'allObjectsJobId');
  }
  return undefined;
};

export const useFindSimilarJobId = (fileId: number): number | undefined => {
  const { getId } = useContext(FileContextualizationContext) || {};

  if (getId) {
    return getId(fileId, 'similarObjectsJobId');
  }
  return undefined;
};

export const useJob = (
  jobId?: number,
  type?: 'findsimilar' | 'findobjects'
) => {
  const sdk = useSDK();
  const [refetchInterval, setRefetchInterval] = useState<
    Record<number, number>
  >({});

  const result = useQuery(
    ['findObjects', jobId],
    (): Promise<Job> => {
      if (!jobId) {
        return Promise.resolve({
          status: undefined,
        });
      }
      return sdk
        .get(
          `/api/playground/projects/${sdk.project}/context/pnidobjects/${type}/${jobId}`
        )
        .then(r => {
          return {
            jobId,
            status: r.data.status,
            annotations: (r.data.items || []).map((a: any) => ({
              ...a,
              id: uuid(),
            })),
          } as Job;
        });
    },
    {
      enabled: !!jobId && !!type,
      staleTime: Infinity,
      refetchInterval: (!!jobId && refetchInterval[jobId]) || false,
    }
  );

  const { status } = result?.data || {};
  if (status === 'Scheduled' || status === 'Queued' || status === 'Running') {
    if (!!jobId && !refetchInterval[jobId]) {
      setRefetchInterval({
        ...refetchInterval,
        [jobId]: 1000,
      });
    }
  } else if (!!jobId && Number.isFinite(refetchInterval[jobId])) {
    delete refetchInterval[jobId];
    setRefetchInterval(refetchInterval);
  }
  return result;
};

export const useFindObjects = () => {
  const sdk = useSDK();
  const { updateJobId } = useContext(FileContextualizationContext) || {};

  if (!updateJobId) {
    throw new Error('FileContextualizationContext not found');
  }

  return useMutation(
    async ({
      fileId,
      boundingBox,
    }: {
      fileId: number;
      boundingBox?: AnnotationBoundingBox;
    }) => {
      const path = boundingBox ? '/findsimilar' : '/findobjects';
      const data = boundingBox
        ? {
            fileId,
            template: {
              boundingBox,
              type: 'detection',
            },
          }
        : { fileId };

      const jobId: number = await sdk
        .post(
          `/api/playground/projects/${sdk.project}/context/pnidobjects${path}`,
          {
            data,
          }
        )
        .then(r => {
          if (Number.isFinite(r.data?.jobId)) {
            return r.data.jobId;
          }
          return Promise.reject(
            new Error('Did not receive the expected job id')
          );
        });

      updateJobId(
        fileId,
        boundingBox ? 'similarObjectsJobId' : 'allObjectsJobId',
        jobId
      );

      return jobId;
    }
  );
};

export const useDeleteFindObjectsJob = () => {
  const { deleteJobId } = useContext(FileContextualizationContext) || {};

  if (!deleteJobId) {
    throw new Error('FileContextualizationContext missing');
  }

  return (fileId: number) => {
    deleteJobId(fileId, 'allObjectsJobId');
  };
};

export const useDeleteFindSimilarJob = () => {
  const { deleteJobId } = useContext(FileContextualizationContext) || {};

  if (!deleteJobId) {
    throw new Error('FileContextualizationContext missing');
  }

  return (fileId: number) => {
    deleteJobId(fileId, 'similarObjectsJobId');
  };
};
