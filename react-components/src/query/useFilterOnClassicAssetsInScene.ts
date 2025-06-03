/*!
 * Copyright 2023 Cognite AS
 */
import type { AddModelOptions } from '@cognite/reveal';
import { useContext, useEffect, useMemo } from 'react';
import type { Asset, CogniteClient, DirectRelationReference } from '@cognite/sdk';
import {
  type AddCadResourceOptions,
  type AddImage360CollectionOptions,
  type AddPointCloudResourceOptions
} from '../components';
import { is360ImageAddOptions, isClassicIdentifier } from '../components/Reveal3DResources/typeGuards';
import { FilterOnClassicAssetsInSceneContext } from './FilterOnClassicAssetsInScene.context';
import { isDefined } from '../utilities/isDefined';

export type FilterOnClassicAssetsInScene = (assets: Asset[]) => Asset[];

export const useFilterOnClassicAssetsInScene = (
  sdk: CogniteClient,
  scene: DirectRelationReference
): FilterOnClassicAssetsInScene | undefined => {
  const {
    useReveal3dResourcesFromScene,
    useAllMappedEquipmentAssetMappings,
    useAllAssetsMapped360Annotations,
    useAllAssetsMappedPointCloudAnnotations
  } = useContext(FilterOnClassicAssetsInSceneContext);

  const resources = useReveal3dResourcesFromScene(scene.externalId, scene.space);
  const cadAndPointCloudresources: AddModelOptions[] = resources.filter(
    (resource): resource is AddCadResourceOptions | AddPointCloudResourceOptions =>
      !is360ImageAddOptions(resource)
  ).map(resource => {
    // We do not care about DM resources
    if (isClassicIdentifier(resource)) {
      return {
        modelId: resource.modelId,
        revisionId: resource.revisionId,
      }
    }
  }).filter(isDefined) ?? [];


  const {
    data: pagedCadAssetMappings,
    isFetching: isFetchingCadAssetMappings,
    hasNextPage: hasNextCadAssetMappings,
    fetchNextPage: fetchNextCadAssetMappingsPage
  } = useAllMappedEquipmentAssetMappings(cadAndPointCloudresources, sdk);

  const filtered360ImageResources = resources.filter(
    (resource): resource is AddImage360CollectionOptions => 'siteId' in resource
  );

  const siteIds = filtered360ImageResources.map((filteredResource) => {
    return 'siteId' in filteredResource ? filteredResource.siteId : filteredResource.externalId;
  });

  const { data: image360AssetMappings, isLoading: isLoading360AssetMappings } =
    useAllAssetsMapped360Annotations(sdk, siteIds);

  const { data: allPointCloudAssets, isLoading: isLoadingAllPointCloudAssets } =
    useAllAssetsMappedPointCloudAnnotations(sdk, cadAndPointCloudresources);

  useEffect(() => {
    if (hasNextCadAssetMappings && !isFetchingCadAssetMappings) {
      void fetchNextCadAssetMappingsPage();
    }
  }, [hasNextCadAssetMappings, isFetchingCadAssetMappings, fetchNextCadAssetMappingsPage]);

  // Build a Map for quick assetId lookup
  const allAssetsMap = useMemo(() => {
    if (
      isFetchingCadAssetMappings ||
      hasNextCadAssetMappings ||
      isLoading360AssetMappings ||
      isLoadingAllPointCloudAssets
    ) {
      return undefined;
    }

    const flattenedCadAssetMappings =
      pagedCadAssetMappings?.pages
        .flat()
        .map((mapping) => mapping.assets)
        .flat() ?? [];

    const all360ImageAssets = image360AssetMappings?.map((mapping) => mapping.asset as Asset) ?? [];
    const allAssetsArray = [
      ...flattenedCadAssetMappings,
      ...all360ImageAssets,
      ...(allPointCloudAssets ?? [])
    ];

    const assetMap = new Map<number, Asset>();

    // There might be duplcate assets, this does however not matter as we are only interested in the presence of the asset
    for (const asset of allAssetsArray) {
      assetMap.set(asset.id, asset);
    }
    return assetMap;
  }, [
    pagedCadAssetMappings,
    image360AssetMappings,
    allPointCloudAssets,
    isFetchingCadAssetMappings,
    hasNextCadAssetMappings,
    isLoading360AssetMappings,
    isLoadingAllPointCloudAssets
  ]);

  if (allAssetsMap === undefined) {
    return undefined;
  }

  return (assets: Asset[]) => assets.filter((asset) => allAssetsMap.has(asset.id));
};
