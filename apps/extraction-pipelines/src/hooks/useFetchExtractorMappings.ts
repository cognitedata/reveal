import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { getProject } from '@cognite/cdf-utilities';
import { useSDK } from '@cognite/sdk-provider';

import { queryKeys } from '../utils/queryKeys';

import { ExtractorMapping } from './types';

export const useFetchExtractorMappings = (
  options?: UseQueryOptions<ExtractorMapping[], number | undefined>
) => {
  const sdk = useSDK();

  return useQuery<ExtractorMapping[], number | undefined>(
    queryKeys.extractorMappings(),
    () =>
      sdk
        .get(`/api/v1/projects/${getProject()}/pluto/mappings`, {
          headers: { 'cdf-version': 'alpha' },
        })
        .then((data) => {
          return data.data?.items;
        }),
    {
      ...options,
    }
  );
};
