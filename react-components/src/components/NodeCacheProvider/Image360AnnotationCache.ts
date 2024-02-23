/*!
 * Copyright 2024 Cognite AS
 */

import { type CogniteClient } from '@cognite/sdk';
import { type Image360AnnotationAssetInfo } from './types';
import { getAssetIdOrExternalIdFromAnnotation } from './utils';
import { type Cognite3DViewer, type Image360Collection } from '@cognite/reveal';
import { useReveal } from '../RevealCanvas/ViewerContext';
import { fetchAssetForAssetIds } from './AnnotationModelUtils';

export class Image360AnnotationCache {
  private readonly _sdk: CogniteClient;
  private readonly _viewer: Cognite3DViewer;
  private readonly _annotationToAssetMappings = new Map<string, Image360AnnotationAssetInfo[]>();

  constructor(sdk: CogniteClient) {
    this._sdk = sdk;
    this._viewer = useReveal();
  }

  public async getReveal360Annotations(siteIds: string[]): Promise<Image360AnnotationAssetInfo[]> {
    const key = siteIds.sort().join();
    const cachedResult = this._annotationToAssetMappings.get(key);

    if (cachedResult !== undefined) {
      return cachedResult;
    }

    const annotationAssets = await this.getReveal360AnnotationInfo();
    if (annotationAssets.length === 0) {
      return [];
    }
    this._annotationToAssetMappings.set(key, annotationAssets);

    return annotationAssets;
  }

  private async getReveal360AnnotationInfo(): Promise<Image360AnnotationAssetInfo[]> {
    const image360Collections = this._viewer.get360ImageCollections();

    const annotationsInfoPromise = await Promise.all(
      image360Collections.map(async (image360Collection: Image360Collection) => {
        const annotations = await image360Collection.getAnnotationsInfo('assets');
        return annotations;
      })
    );

    const annotationsInfo = annotationsInfoPromise.flat();

    const filteredAssetIds = new Set<string | number>();
    annotationsInfo.forEach((annotation) => {
      const assetId = getAssetIdOrExternalIdFromAnnotation(annotation.annotationInfo);
      if (assetId !== undefined) {
        filteredAssetIds.add(assetId);
      }
    });

    const assetsArray = await fetchAssetForAssetIds(Array.from(filteredAssetIds), this._sdk);
    const assets = new Map(assetsArray.map((asset) => [asset.id, asset]));

    const assetsWithAnnotations = annotationsInfo.flatMap((annotationInfo) => {
      const assetId = annotationInfo.annotationInfo.data.assetRef.id;
      if (assetId !== undefined && assets.has(assetId)) {
        const asset = assets.get(assetId);
        if (asset !== undefined) {
          return [
            {
              asset,
              assetAnnotationImage360Info: annotationInfo
            }
          ];
        }
      }
      return [];
    });

    return assetsWithAnnotations;
  }
}
