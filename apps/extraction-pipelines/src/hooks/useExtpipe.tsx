import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import {
  deleteExtractionPipeline,
  getExtpipeByExternalId,
  getExtpipeById,
} from 'utils/ExtpipesAPI';
import { Extpipe } from 'model/Extpipe';
import { ErrorVariations, SDKError } from 'model/SDKErrors';
import { RouterParams } from 'routing/RoutingConfig';
import { useParams } from 'react-router-dom';

export const useExtpipeById = (extpipeId?: number) => {
  const sdk = useSDK();
  return useQuery<Extpipe, SDKError>(
    ['extpipe', extpipeId],
    () => {
      return getExtpipeById(sdk, extpipeId!);
    },
    {
      enabled: !!extpipeId,
    }
  );
};

export const useExtpipeByExternalId = (
  externalId: string,
  options?: Omit<UseQueryOptions<Extpipe, SDKError>, 'queryKey' | 'queryFn'>
) => {
  const sdk = useSDK();
  return useQuery<Extpipe, SDKError>(
    ['extpipe', externalId],
    () => {
      return getExtpipeByExternalId(sdk, externalId);
    },
    options
  );
};

export const useSelectedExtpipeId = () => {
  return parseInt(useParams<RouterParams>().id, 10);
};

export const useSelectedExtpipe = () => {
  const id = useSelectedExtpipeId();
  return useExtpipeById(id);
};

export const useDeletePipeline = (
  opts?: Omit<
    UseMutationOptions<unknown, ErrorVariations, number>,
    'mutationFn'
  >
) => {
  const sdk = useSDK();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteExtractionPipeline(sdk, id),
    onSuccess(data, variables, context) {
      if (opts?.onSuccess) {
        opts.onSuccess(data, variables, context);
      }
      qc.invalidateQueries(['extpipe']);
      qc.invalidateQueries(['extpipes']);
    },
    ...opts,
  });
};
