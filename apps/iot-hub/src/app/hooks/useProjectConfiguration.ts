import { useQuery } from '@tanstack/react-query';

import sdk from '@cognite/cdf-sdk-singleton';

import { QUERY_KEY } from '.';

export const useProjectConfiguration = () =>
  useQuery(QUERY_KEY.GET_PROJECT_CONFIG(), async () => {
    const { data } = await sdk.get<{
      oidcConfiguration: { tokenUrl: string };
    }>(`/api/v1/projects/${sdk.project}`);
    return data;
  });
