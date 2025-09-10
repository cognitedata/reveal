import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { type IdEither, type Asset, CogniteError } from '@cognite/sdk';

import { queryKeys } from '../utilities/queryKeys';
import { useSDK } from '../components/RevealCanvas/SDKProvider';
import { getAssetsByIds } from '../hooks/network/getAssetsByIds';

type CustomCogniteError = CogniteError & {
  responses?: { items: Asset[] }[];
};

export const useAssetsByIdsQuery = (ids: IdEither[]): UseQueryResult<Asset[]> => {
  const sdk = useSDK();
  return useQuery({
    queryKey: queryKeys.assetsById(ids),
    queryFn: async () => {
      try {
        return await getAssetsByIds(sdk, ids);
      } catch (error) {
        const caughtResponse = error as CustomCogniteError;
        if (
          caughtResponse.status === 403 &&
          caughtResponse.responses && caughtResponse.responses.length > 0
        ) {
          const assets = caughtResponse.responses.flatMap((response: { items: Asset[] }) => response.items);
          return assets;
        }
        return [];
      }
    },
    enabled: ids.length > 0
  });
};
