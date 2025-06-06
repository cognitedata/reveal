import { type AddModelOptions, type ClassicDataSourceType } from '@cognite/reveal';
import { type Asset, type CogniteClient } from '@cognite/sdk';

import { type AddImage360CollectionDatamodelsOptions } from '../../components/Reveal3DResources/types';
import { type RevealRenderTarget } from '../../architecture';
import { searchClassicAssetsForCadModels } from './searchClassicAssetsForCadModels';

export type SearchClassicAssetsResponse = {
  nextCursor: string | undefined;
  data: Asset[];
};

export async function searchClassicAssetsForModels(
  searchQuery: string,
  models: Array<AddModelOptions<ClassicDataSourceType>>,
  _image360Collections: AddImage360CollectionDatamodelsOptions[],
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
  // This code will be used in shortly upcoming work: 2025-06-06
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

  return { nextCursor, data: cadAssets /* .concat(pointCloudAssets).concat(image360Assets) */ };
}
