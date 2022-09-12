import { useInfiniteQuery } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import { getExtpipes } from 'utils/ExtpipesAPI';
import { SDKError } from 'model/SDKErrors';
import { ExtpipeAPIResponse } from 'model/ExtpipeAPIResponse';
import { useEffect } from 'react';

export const useExtpipes = (limit: number = 50) => {
  const sdk = useSDK();
  return useInfiniteQuery<ExtpipeAPIResponse, SDKError>(
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
