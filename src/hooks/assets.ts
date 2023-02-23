import { Asset, CogniteError } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import {
  QueryKey,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
} from '@tanstack/react-query';

const useAssetsKey = (): QueryKey => ['assets', 'list'];

export const useAssets = (
  opts?: UseInfiniteQueryOptions<
    { items: Asset[]; nextPage?: string },
    CogniteError
  >
) => {
  const sdk = useSDK();
  return useInfiniteQuery(
    useAssetsKey(),
    ({ pageParam }) => sdk.assets.list({ cursor: pageParam }),
    {
      getNextPageParam(lastPage) {
        return lastPage.nextPage;
      },
      ...opts,
    }
  );
};
