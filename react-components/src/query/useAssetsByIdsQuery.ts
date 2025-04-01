/*!
 * Copyright 2024 Cognite AS
 */
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { type IdEither, type Asset } from '@cognite/sdk';

import { queryKeys } from '../utilities/queryKeys';
import { useSDK } from '../components/RevealCanvas/SDKProvider';
import { getAssetsByIds } from '../hooks/network/getAssetsByIds';
import { executeParallel } from '../utilities/executeParallel';
import { chunk } from 'lodash';
import { MAX_PARALLEL_QUERIES } from '../data-providers/utils/getDMSModelRevisionRefs';
import { isDefined } from '../utilities/isDefined';

export const useAssetsByIdsQuery = (ids: IdEither[]): UseQueryResult<Asset[]> => {
  const sdk = useSDK();
  return useQuery({
    queryKey: queryKeys.assetsById(ids),
    queryFn: async () => {

      const idsChunks = chunk(ids, 1000);

      const instancesContent = await executeParallel(
        idsChunks.map((chunk) => async () => {
          return await getAssetsByIds(sdk, chunk);
        }
      ),
        MAX_PARALLEL_QUERIES
      );

      console.log(' TEST assets getAssetsByIds instancesContent ', instancesContent.flat().filter(isDefined));
      return instancesContent.flat().filter(isDefined);

    },
    enabled: ids.length > 0
  });
};
