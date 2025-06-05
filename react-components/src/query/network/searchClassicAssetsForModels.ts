import { AddModelOptions, ClassicDataSourceType } from '@cognite/reveal';
import { Asset, CogniteClient } from '@cognite/sdk';

import { AddImage360CollectionDatamodelsOptions } from '../../components/Reveal3DResources/types';
import { RevealRenderTarget } from '../../architecture';
import { searchClassicAssetsForCadModels } from './searchClassicAssetsForCadModels';
import { InfiniteData, useInfiniteQuery, UseInfiniteQueryResult } from '@tanstack/react-query';
import { useSDK } from '../../components/RevealCanvas/SDKProvider';
import { useRenderTarget } from '../../components';

export type SearchClassicAssetsResponse = {
  nextCursor: string | undefined;
  data: Asset[];
};

export async function searchClassicAssetsForModels(
  searchQuery: string,
  models: AddModelOptions<ClassicDataSourceType>[],
  image360Collections: AddImage360CollectionDatamodelsOptions[],
  limit: number,
  cadAssetsCursor: string | undefined,
  sdk: CogniteClient,
  renderTarget: RevealRenderTarget
): Promise<SearchClassicAssetsResponse> {
  const assetMappingAndNode3DCache = renderTarget.cdfCaches.assetMappingAndNode3dCache;

  const cadAssetsPromise = searchClassicAssetsForCadModels(
    searchQuery,
    models,
    limit,
    cadAssetsCursor,
    sdk,
    assetMappingAndNode3DCache
  );

  /*
  const isFirstPage = cadAssetsCursor === undefined;

  const pointCloudAssetsPromise = isFirstPage
    ? Promise.resolve([])
    : searchClassicPointCloudAssets(searchQuery, models, limit, sdk);

  const image360AssetsPromise = isFirstPage
    ? Promise.resolve([])
    : searchClassicImage360Assets(searchQuery, image360Collections, limit, sdk);
  */

  const { nextCursor, data: cadAssets } = await cadAssetsPromise;
  // const pointCloudAssets = await pointCloudAssetsPromise;
  // const image360Assets = await image360AssetsPromise;

  return { nextCursor, data: cadAssets /*.concat(pointCloudAssets).concat(image360Assets) */ };
}

function useSearchClassicAssetsForModels(
  searchQuery: string,
  models: AddModelOptions<ClassicDataSourceType>[],
  image360Collections: AddImage360CollectionDatamodelsOptions[],
  limit: number
): UseInfiniteQueryResult<InfiniteData<SearchClassicAssetsResponse>> {
  const sdk = useSDK();
  const renderTarget = useRenderTarget();

  return useInfiniteQuery({
    queryKey: [
      'reveal',
      'react-components',
      'search-mapped-asset-mappings',
      searchQuery,
      ...models.map((model) => [model.modelId, model.revisionId])
    ],
    initialPageParam: { cursor: undefined },
    getNextPageParam: (lastPage: SearchClassicAssetsResponse) => ({ cursor: lastPage.nextCursor }),
    queryFn: async ({ pageParam }) =>
      searchClassicAssetsForModels(
        searchQuery,
        models,
        image360Collections,
        limit,
        pageParam.cursor,
        sdk,
        renderTarget
      )
  });
}
