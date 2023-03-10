import { useSDK } from '@cognite/sdk-provider';
import { CogniteError, ExternalId, InternalId } from '@cognite/sdk';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';

import { RawSource, RawTarget } from 'types/api';

type PipelineSource = {
  dataSetIds?: InternalId[] | ExternalId[];
  type: RawSource;
};

type PipelineTarget = {
  dataSetIds?: InternalId[] | ExternalId[];
  type: RawTarget;
};

type PipelineMatch = {
  sourceId?: string;
  sourceExternalId?: string;
  targetId?: string;
  targetExternalId?: string;
};

type PipelineRead = {
  id?: number;
  externalId?: string;
  name?: string;
  description?: string;
  sources?: PipelineSource[];
  targets?: PipelineTarget[];
  confirmedMatches?: PipelineMatch[];
  rejectedMatches?: PipelineMatch[];
  useExistingMatches?: boolean;
  scoreThreshold?: number;
};

type PipelineCreate = Pick<PipelineRead, 'name' | 'description'>;

export const useCreatePipeline = (
  options?: UseMutationOptions<PipelineRead, CogniteError, PipelineCreate>
) => {
  const sdk = useSDK();

  return useMutation<PipelineRead, CogniteError, PipelineCreate>(
    async ({ name, description }) => {
      return sdk
        .post<PipelineRead>(
          `/api/playground/projects/${sdk.project}/context/entitymatching/pipelines`,
          {
            data: {
              name,
              description,
              sources: {
                dataSetIds: [],
                resource: 'time_series', // TODO: update
              },
              targets: {
                dataSetIds: [],
                resource: 'assets', // TODO: update
              },
            },
          }
        )
        .then((r) => {
          if (r.status === 200) {
            return r.data;
          } else {
            return Promise.reject(r);
          }
        });
    },
    {
      ...options,
      onSuccess: () => {
        // TODO: invalidate pipeline list
      },
    }
  );
};
