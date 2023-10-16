/*!
 * Copyright 2023 Cognite AS
 */

import { type Asset, type CogniteClient } from '@cognite/sdk';
import { type QueryFunction } from '@tanstack/query-core';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { chunk, keyBy } from 'lodash';

export const getAssets = (
  uniqueAssets: Array<{
    annotationId: number;
    assetId: number;
  }>,
  sdk: CogniteClient
): UseQueryResult<Record<number, Asset> | undefined, unknown> => {
  const queryFunction: QueryFunction<Record<number, Asset> | undefined> = async () => {
    const assetsPromises = await Promise.all(
      chunk(uniqueAssets, 1000).map(async (uniqueAssetsChunk) => {
        const retrievedAssets = await sdk.assets.retrieve(
          uniqueAssetsChunk.map(({ assetId }) => ({
            id: assetId
          })),
          { ignoreUnknownIds: true }
        );
        return retrievedAssets;
      })
    );

    const assets = keyBy(assetsPromises.flat(), 'id');
    return assets;
  };

  const queryResult = useQuery<Record<number, Asset> | undefined>(
    ['cdf', '3d', 'assets', JSON.stringify(uniqueAssets)],
    queryFunction,
    {
      staleTime: Infinity
    }
  );

  return queryResult;
};
