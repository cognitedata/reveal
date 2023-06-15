import { useParams } from 'react-router-dom';

import { Extpipe } from '@extraction-pipelines/model/Extpipe';
import { RouterParams } from '@extraction-pipelines/routing/RoutingConfig';
import {
  deleteExtractionPipeline,
  getExtpipeById,
} from '@extraction-pipelines/utils/ExtpipesAPI';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { CogniteError } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

export const useSelectedExtpipeId = () => {
  return parseInt(useParams<RouterParams>().id ?? '', 10);
};

const useExtpipeById = (extpipeId?: number) => {
  const sdk = useSDK();
  return useQuery<Extpipe, CogniteError>(
    ['extpipe', extpipeId],
    () => {
      return getExtpipeById(sdk, extpipeId!);
    },
    {
      enabled: !!extpipeId,
    }
  );
};
export const useSelectedExtpipe = () => {
  const id = useSelectedExtpipeId();
  return useExtpipeById(id);
};

export const useDeletePipeline = (
  opts?: Omit<UseMutationOptions<unknown, CogniteError, number>, 'mutationFn'>
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
