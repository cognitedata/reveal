import { useEffect } from 'react';

import { ExtpipeAPIResponse } from '@extraction-pipelines/model/ExtpipeAPIResponse';
import { getExtpipes } from '@extraction-pipelines/utils/ExtpipesAPI';
import { useInfiniteQuery } from '@tanstack/react-query';

import { CogniteError } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

export const useExtpipes = (limit = 50) => {
  const sdk = useSDK();
  return useInfiniteQuery<ExtpipeAPIResponse, CogniteError>(
    ['extpipes', { limit }],
    async ({ pageParam: cursor }) => getExtpipes(sdk, { limit, cursor }),
    {
      getNextPageParam: (page) => page.nextCursor,
    }
  );
};

export const useAllExtpipes = () => {
  const q = useExtpipes(1000);

  useEffect(() => {
    if (q.hasNextPage && !q.isFetchingNextPage) {
      q.fetchNextPage();
    }
  }, [q]);

  return q;
};
