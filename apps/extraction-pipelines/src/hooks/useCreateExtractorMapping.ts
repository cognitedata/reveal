import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';

import { getProject } from '@cognite/cdf-utilities';
import { useSDK } from '@cognite/sdk-provider';

import { queryKeys } from '../utils/queryKeys';

import { CreateExtractorMapping, ExtractorMapping } from './types';

export const useCreateExtractorMapping = (
  options?: UseMutationOptions<
    ExtractorMapping[],
    unknown,
    CreateExtractorMapping
  >
) => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  return useMutation(
    async (mapping: CreateExtractorMapping) => {
      return sdk
        .post(`/api/v1/projects/${getProject()}/pluto/mappings`, {
          headers: { 'cdf-version': 'alpha' },
          data: {
            items: [mapping],
          },
        })
        .then((data) => data.data?.items);
    },
    {
      ...options,
      onSuccess: async (data, variables, context) => {
        await queryClient.invalidateQueries(queryKeys.extractorMappings());
        options?.onSuccess?.(data, variables, context);
      },
    }
  );
};
