import { type TaggedAddResourceOptions } from '../../components/Reveal3DResources/types';

import { isClassicIdentifier } from '../../components/Reveal3DResources/typeGuards';
import { uniqBy } from 'lodash';
import { searchClassicImage360Assets } from './searchClassicImage360Assets';

import { type Asset, type CogniteClient } from '@cognite/sdk';

import { type RevealRenderTarget } from '../../architecture';
import { searchClassicAssetsForCadModels } from './searchClassicAssetsForCadModels';
import { getAssetsMappedPointCloudAnnotations } from './getAssetMappedPointCloudAnnotations';
import { type AllAssetFilterProps } from './types';

export type SearchClassicAssetsResponse = {
  nextCursor: string | undefined;
  data: Asset[];
};

export type SearchQueryOptions = {
  limit: number;
  cadAssetsCursor?: string;
  filters?: AllAssetFilterProps;
};

export async function searchClassicAssetsForModels(
  resources: TaggedAddResourceOptions[],
  { limit, cadAssetsCursor, filters }: SearchQueryOptions,
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
    cadModels,
    limit,
    cadAssetsCursor,
    filters,
    sdk,
    assetMappingAndNode3DCache
  );

  const pointCloudAssetsPromise = isFirstPage
    ? getAssetsMappedPointCloudAnnotations(pointClouds, filters, sdk)
    : Promise.resolve([]);

  const image360AssetsPromise = isFirstPage
    ? searchClassicImage360Assets(image360Collections, filters, limit, sdk)
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
