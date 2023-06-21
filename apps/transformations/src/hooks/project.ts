import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { BASE_QUERY_KEY } from '@transformations/common';
import { getProjectBaseUrl } from '@transformations/utils';

import { ProjectResponse } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

export const useProject = (options?: UseQueryOptions<ProjectResponse>) => {
  const sdk = useSDK();

  return useQuery<ProjectResponse>(
    [BASE_QUERY_KEY, 'project-details'],
    () =>
      sdk.get<ProjectResponse>(getProjectBaseUrl()).then(({ data }) => data),
    options
  );
};
