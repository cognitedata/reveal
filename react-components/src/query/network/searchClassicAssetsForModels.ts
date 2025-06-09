import { type TaggedAddResourceOptions } from '../../components/Reveal3DResources/types';

import { searchClassicPointCloudAssets } from './searchClassicPointCloudAssets';
import { isClassicIdentifier } from '../../components/Reveal3DResources/typeGuards';
import { uniqBy } from 'lodash';

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

  const { nextCursor, data: cadAssets } = await cadAssetsPromise;
  const pointCloudAssets = await pointCloudAssetsPromise;

  const assetResult = uniqBy([...cadAssets, ...pointCloudAssets], (asset) => asset.id);

  return { nextCursor, data: assetResult };
}
