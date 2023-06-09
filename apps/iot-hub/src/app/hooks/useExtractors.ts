import { useQuery } from '@tanstack/react-query';

import sdk from '@cognite/cdf-sdk-singleton';

import { QUERY_KEY } from '.';

export const useExtractors = () =>
  useQuery(QUERY_KEY.GET_EXTRACTORS(), async () => {
    const { data } = await sdk.get<{
      items: { name: string; externalId: string }[];
    }>(`/api/playground/projects/${sdk.project}/extractors/`);
    return data.items;
  });
