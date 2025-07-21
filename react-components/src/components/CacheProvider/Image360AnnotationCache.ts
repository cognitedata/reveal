import { type CogniteClient } from '@cognite/sdk';
import { type Image360AnnotationAssetInfo } from './types';
import {
  getAssetIdKeyForImage360Annotation,
  getInstanceReferenceFromImage360Annotation
} from './utils';
import {
  type DataSourceType,
  type Cognite3DViewer,
  type Image360Collection,
  type Image360AnnotationAssetQueryResult
} from '@cognite/reveal';
import { fetchAssetsForAssetReferences } from './annotationModelUtils';
import { isDefined } from '../../utilities/isDefined';
import { assetInstanceToKey } from '../../utilities/assetInstanceToKey';
import { isInternalId, type InstanceReference } from '../../utilities/instanceIds';
import { createInstanceReferenceKey } from '../../utilities/instanceIds/toKey';
import { chunk, uniqBy } from 'lodash';
import { type AssetInstance } from '../../utilities/instances';

export class Image360AnnotationCache {
  private readonly _sdk: CogniteClient;
  private readonly _viewer: Cognite3DViewer<DataSourceType> | undefined;
  private readonly _annotationToAssetMappingsWithAssetInstance = new Map<
    string,
    Image360AnnotationAssetInfo[]
  >();

  constructor(sdk: CogniteClient, viewer: Cognite3DViewer<DataSourceType> | undefined) {
    this._sdk = sdk;
    this._viewer = viewer;
  }

  public async getReveal360AnnotationsForAssets(
    siteIds: string[],
    assetInstances: InstanceReference[]
  ): Promise<Image360AnnotationAssetInfo[]> {
    if (this._viewer === undefined || siteIds.length === 0 || assetInstances.length === 0) {
      return [];
    }
    const image360Collections = this._viewer.get360ImageCollections();

    const filteredImageCollections = image360Collections.filter((image360Collections) => {
      return siteIds.includes(image360Collections.id);
    });

    const key = assetInstances.map(createInstanceReferenceKey).sort().join();
    const cachedResult = this._annotationToAssetMappingsWithAssetInstance.get(key);

    if (cachedResult !== undefined) {
      return cachedResult;
    }

    const annotationAssets = await this.getReveal360AnnotationInfoForAssets(
      assetInstances,
      filteredImageCollections
    );
    if (annotationAssets.length === 0) {
      return [];
    }
    this._annotationToAssetMappingsWithAssetInstance.set(key, annotationAssets);

    return annotationAssets;
  }

  private async getReveal360AnnotationInfoForAssets(
    assetInstances: InstanceReference[],
    image360Collections: Array<Image360Collection<DataSourceType>>
  ): Promise<Image360AnnotationAssetInfo[]> {
    const image360AnnotationAssetNested = await Promise.all(
      chunk(assetInstances, 5).flatMap((assetInstancesChunk) =>
        assetInstancesChunk.map(
          async (assetInstance) =>
            await Promise.all(
              chunk(image360Collections, 5).flatMap((image360CollectionsChunk) =>
                image360CollectionsChunk.map(
                  async (image360Collection) =>
                    await image360Collection.findImageAnnotations({
                      assetRef: isInternalId(assetInstance)
                        ? { id: assetInstance.id }
                        : assetInstance
                    })
                )
              )
            ).then((results) => results.flat())
        )
      )
    );
    const image360AnnotationAssets = image360AnnotationAssetNested.flat();

    const assetIds = image360AnnotationAssets.reduce<InstanceReference[]>(
      (acc, image360AnnotationAsset) => {
        const assetRef = getInstanceReferenceFromImage360Annotation(
          image360AnnotationAsset.annotation.annotation
        );
        if (assetRef !== undefined) {
          acc.push(assetRef);
        }
        return acc;
      },
      []
    );
    const uniqueAssetIds = uniqBy(assetIds, createInstanceReferenceKey);

    const assetsArray = await fetchAssetsForAssetReferences(uniqueAssetIds, this._sdk);
    const assets = new Map(assetsArray.map((asset) => [assetInstanceToKey(asset), asset]));

    const assetsWithAnnotations = this.getAssetWithAnnotationsMapped(
      image360AnnotationAssets,
      assets
    );

    return assetsWithAnnotations;
  }

  private getAssetWithAnnotationsMapped(
    image360AnnotationAssets: Array<Image360AnnotationAssetQueryResult<DataSourceType>>,
    assets: Map<string, AssetInstance>
  ): Image360AnnotationAssetInfo[] {
    const image360AnnotationAssetInfo = image360AnnotationAssets
      .filter((image360AnnotationAsset) => {
        const idRef = getAssetIdKeyForImage360Annotation(
          image360AnnotationAsset.annotation.annotation
        );
        return idRef !== undefined && assets.has(idRef);
      })
      .map((image360AnnotationAsset) =>
        createAnnotationInfoWithAsset(image360AnnotationAsset, assets)
      );

    return image360AnnotationAssetInfo.filter(isDefined);
  }
}

function createAnnotationInfoWithAsset(
  image360AnnotationAsset: Image360AnnotationAssetQueryResult<DataSourceType>,
  assets: Map<string, AssetInstance>
): Image360AnnotationAssetInfo | undefined {
  const idRef = getAssetIdKeyForImage360Annotation(image360AnnotationAsset.annotation.annotation);
  if (idRef === undefined) {
    return undefined;
  }
  const asset = assets.get(idRef);
  if (asset === undefined) {
    return undefined;
  }

  return {
    asset,
    assetAnnotationImage360Info: image360AnnotationAsset,
    position: image360AnnotationAsset.annotation
      .getCenter()
      .applyMatrix4(image360AnnotationAsset.image.transform)
  };
}
