import { type TaggedAddResourceOptions } from '../../components/Reveal3DResources/types';

import { searchClassicPointCloudAssets } from './searchClassicPointCloudAssets';
import { isClassicIdentifier } from '../../components/Reveal3DResources/typeGuards';
import { uniqBy } from 'lodash';
import { searchClassicImage360Assets } from './searchClassicImage360Assets';

import { type Asset, type CogniteClient } from '@cognite/sdk';

import { type RevealRenderTarget } from '../../architecture';
import { searchClassicAssetsForCadModels } from './searchClassicAssetsForCadModels';

export type SearchClassicAssetsResponse = {
  nextCursor: string | undefined;
  data: Asset[];
};

export async function searchClassicAssetsForModels(
  searchQuery: string,
  resources: TaggedAddResourceOptions[],
  limit: number,
  cadAssetsCursor: string | undefined,
  sdk: CogniteClient,
  renderTarget: RevealRenderTarget
): Promise<SearchClassicAssetsResponse> {
  const isFirstPage = cadAssetsCursor === undefined;

  const assetMappingAndNode3DCache = renderTarget.cdfCaches.assetMappingAndNode3dCache;

  const cadModels = resources
    .filter((resource) => resource.type === 'cad')
    .map((resource) => resource.addOptions)
    .filter(isClassicIdentifier);

  const pointClouds = resources
    .filter((resource) => resource.type === 'pointcloud')
    .map((resource) => resource.addOptions)
    .filter(isClassicIdentifier);

  const image360Collections = resources
    .filter((resource) => resource.type === 'image360')
    .map((resource) => resource.addOptions);

  const cadAssetsPromise = searchClassicAssetsForCadModels(
    searchQuery,
    cadModels,
    limit,
    cadAssetsCursor,
    sdk,
    assetMappingAndNode3DCache
  );

  const pointCloudAssetsPromise = isFirstPage
    ? searchClassicPointCloudAssets(searchQuery, pointClouds, sdk)
    : Promise.resolve([]);

  const image360AssetsPromise = isFirstPage
    ? searchClassicImage360Assets(searchQuery, image360Collections, limit, sdk)
    : Promise.resolve([]);

  const { nextCursor, data: cadAssets } = await cadAssetsPromise;
  const pointCloudAssets = await pointCloudAssetsPromise;
  const image360Assets = await image360AssetsPromise;

  const assetResult = uniqBy(
    [...cadAssets, ...pointCloudAssets, ...image360Assets],
    (asset) => asset.id
  );

  return { nextCursor, data: assetResult };
}
