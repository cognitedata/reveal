/*!
 * Copyright 2024 Cognite AS
 */
import { type CogniteClient, type Asset } from '@cognite/sdk/dist/src';
import { uniqBy, chunk } from 'lodash';
import { filterUndefined } from '../../utilities/filterUndefined';
import { type RevealAnnotationModel } from './types';
import { getAssetIdOrExternalIdFromAnnotation } from './utils';

export async function fetchAnnotationAssets(
  annotations: RevealAnnotationModel[],
  sdk: CogniteClient
): Promise<Map<number, Asset>> {
  const annotationMapping = annotations.map((annotation) => {
    const assetId = getAssetIdOrExternalIdFromAnnotation(annotation);
    if (assetId === undefined) {
      return undefined;
    }
    return {
      annotationId: annotation.id,
      assetId
    };
  });
  const filteredAnnotationMapping = filterUndefined(annotationMapping);

  const uniqueAnnotationMapping = uniqBy(filteredAnnotationMapping, 'assetId');
  const assetIds = uniqueAnnotationMapping.map((mapping) => mapping.assetId);
  const assets = await fetchAssetForAssetIds(assetIds, sdk);

  const annotationIdToAssetMap = new Map<number, Asset>();
  assets.forEach((asset) => {
    filteredAnnotationMapping.forEach((mapping) => {
      if (mapping.assetId === asset.id) {
        annotationIdToAssetMap.set(mapping.annotationId, asset);
      }
    });
  });
  return annotationIdToAssetMap;
}

async function fetchAssetForAssetIds(
  assetIds: Array<string | number>,
  sdk: CogniteClient
): Promise<Asset[]> {
  const assetsResult = await Promise.all(
    chunk(assetIds, 1000).map(async (assetIdsChunck) => {
      const retrievedAssets = await sdk.assets.retrieve(
        assetIdsChunck.map((assetId) => {
          if (typeof assetId === 'number') {
            return { id: assetId };
          } else {
            return { externalId: assetId };
          }
        }),
        { ignoreUnknownIds: true }
      );
      return retrievedAssets;
    })
  );

  return assetsResult.flat();
}
