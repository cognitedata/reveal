import { UseQueryOptions, useQuery } from '@tanstack/react-query';

import { IdEither } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { queryKeys } from '../../../queryKeys';
import { InternalAssetData } from '../../internal';
import { getAssetsByIds } from '../network';

export const useAssetsByIdQuery = <T = InternalAssetData>(
  ids: IdEither[],
  options?: Omit<UseQueryOptions<InternalAssetData[], any, T[]>, 'queryKey'>
) => {
  const sdk = useSDK();
  return useQuery(
    queryKeys.assetByIds(ids),
    () => getAssetsByIds(sdk, ids || []),
    options
  );
};
