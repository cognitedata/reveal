import { useEffect } from 'react';

import { useInfiniteQuery } from '@tanstack/react-query';

import { CogniteError } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { ExtpipeAPIResponse } from '../model/ExtpipeAPIResponse';
import { getExtpipes } from '../utils/ExtpipesAPI';

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
