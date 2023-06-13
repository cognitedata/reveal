import { useQuery } from '@tanstack/react-query';

import sdk from '@cognite/cdf-sdk-singleton';

import { QUERY_KEY } from '.';

export const useExtractorPipelines = () =>
  useQuery(QUERY_KEY.GET_EXTRACTOR_PIPELINES(), async () => {
    const { data } = await sdk.post<{
      items: { id: string; externalId: string }[];
    }>(`/api/v1/projects/${sdk.project}/extpipes/list`, {
      data: { limit: 1000 },
    });
    return data.items;
  });
