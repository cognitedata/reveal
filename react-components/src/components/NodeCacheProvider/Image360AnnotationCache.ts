/*!
 * Copyright 2024 Cognite AS
 */

import { type Asset, type CogniteClient } from '@cognite/sdk';
import { type Image360AnnotationAssetInfo } from './types';
import { getAssetIdOrExternalIdFromImage360Annotation } from './utils';
import {
  type AssetAnnotationImage360Info,
  type Cognite3DViewer,
  type Image360Collection
} from '@cognite/reveal';
import { fetchAssetForAssetIds } from './AnnotationModelUtils';
import { type Vector3 } from 'three';

export class Image360AnnotationCache {
  private readonly _sdk: CogniteClient;
  private readonly _viewer: Cognite3DViewer | undefined;
  private readonly _annotationToAssetMappings = new Map<string, Image360AnnotationAssetInfo[]>();

  constructor(sdk: CogniteClient, viewer: Cognite3DViewer | undefined) {
    this._sdk = sdk;
    this._viewer = viewer;
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
    if (this._viewer === undefined) {
      return [];
    }
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
      const assetId = getAssetIdOrExternalIdFromImage360Annotation(annotation.annotationInfo);
      if (assetId !== undefined) {
        filteredAssetIds.add(assetId);
      }
    });

    const assetsArray = await fetchAssetForAssetIds(Array.from(filteredAssetIds), this._sdk);
    const assets = new Map(assetsArray.map((asset) => [asset.id, asset]));
    const assetsWithAnnotations = await this.getAssetWithAnnotationsMapped(annotationsInfo, assets);

    return assetsWithAnnotations;
  }

  private async getAssetWithAnnotationsMapped(
    annotationsInfo: AssetAnnotationImage360Info[],
    assets: Map<number, Asset>
  ): Promise<Image360AnnotationAssetInfo[]> {
    const assetsWithAnnotationsPromises: Array<Promise<Image360AnnotationAssetInfo | undefined>> =
      annotationsInfo.map(async (annotationInfo) => {
        const assetId = annotationInfo.annotationInfo.data.assetRef.id;
        if (assetId !== undefined && assets.has(assetId)) {
          const asset = assets.get(assetId);
          if (asset === undefined) {
            return undefined;
          }
          const transform = annotationInfo.imageEntity.transform;
          const revisionAnnotations = await annotationInfo.imageRevision.getAnnotations();

          const centerPosition: Vector3[] = revisionAnnotations.reduce(
            (acc: Vector3[], revisionAnnotation) => {
              if (
                assetId ===
                getAssetIdOrExternalIdFromImage360Annotation(revisionAnnotation.annotation)
              ) {
                const center = revisionAnnotation.getCenter().applyMatrix4(transform);
                if (center !== undefined) {
                  acc.push(center);
                }
              }
              return acc;
            },
            []
          );

          if (centerPosition.length === 0) {
            return undefined;
          }

          return {
            asset,
            assetAnnotationImage360Info: annotationInfo,
            positions: centerPosition
          };
        }
        return undefined;
      });

    const assetsWithAnnotations = (await Promise.all(assetsWithAnnotationsPromises)).filter(
      Boolean
    ) as Image360AnnotationAssetInfo[];

    return assetsWithAnnotations;
  }
}
