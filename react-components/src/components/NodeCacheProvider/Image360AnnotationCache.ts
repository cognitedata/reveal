/*!
 * Copyright 2024 Cognite AS
 */

import {
  type FileFilterProps,
  type AnnotationFilterProps,
  type Asset,
  type CogniteClient
} from '@cognite/sdk';
import { type RevealAnnotationModel } from './types';
import assert from 'assert';
import { getAssetIdOrExternalIdFromAnnotation } from './utils';
import { fetchAnnotationAssets } from './AnnotationModelUtils';
import { chunk } from 'lodash';

export class Image360AnnotationCache {
  private readonly _sdk: CogniteClient;
  private readonly _imageCollecctionToAnnotationAssetMappings = new Map<
    string,
    Promise<Map<number, Asset>>
  >();

  private readonly _modelToAnnotationMappings = new Map<string, RevealAnnotationModel[]>();

  constructor(sdk: CogniteClient) {
    this._sdk = sdk;
  }

  public async getImage360AnnotationsForSiteId(siteId: string): Promise<RevealAnnotationModel[]> {
    const key = `${siteId}`;
    const cachedResult = this._modelToAnnotationMappings.get(key);

    if (cachedResult !== undefined) {
      return cachedResult;
    }

    const annotationModels = await this.fetchAnnotationForSiteId(siteId);

    this._modelToAnnotationMappings.set(key, annotationModels);

    return annotationModels;
  }

  public async getImage360AnnotationAssetsForSiteId(siteId: string): Promise<Map<number, Asset>> {
    const key = `${siteId}`;
    const cachedResult = this._imageCollecctionToAnnotationAssetMappings.get(key);

    if (cachedResult !== undefined) {
      return await cachedResult;
    }

    const modelToAnnotationAssetMappings = this.fetchAssetMappingsForSiteId(siteId);
    this._imageCollecctionToAnnotationAssetMappings.set(key, modelToAnnotationAssetMappings);

    return await modelToAnnotationAssetMappings;
  }

  public async matchImage360AnnotationsForSiteId(
    siteId: string,
    assetId: string | number
  ): Promise<Map<number, Asset> | undefined> {
    const fetchedAnnotationAssetMappings = await this.getImage360AnnotationAssetsForSiteId(siteId);

    const assetIdNumber = typeof assetId === 'number' ? assetId : undefined;
    const matchedAnnotations = Array.from(fetchedAnnotationAssetMappings.entries()).filter(
      ([, asset]) => asset.id === assetIdNumber
    );
    return matchedAnnotations.length > 0 ? new Map(matchedAnnotations) : undefined;
  }

  private async fetchAnnotationForSiteId(siteId: string): Promise<RevealAnnotationModel[]> {
    const fileIdsList = await this.get360ImagesFileIds(siteId);
    const annotationModels = await this.get360ImageAnnotations(fileIdsList);
    return annotationModels;
  }

  private async fetchAssetMappingsForSiteId(siteId: string): Promise<Map<number, Asset>> {
    const annotationModels = await this.getImage360AnnotationsForSiteId(siteId);
    const annotationAssets = fetchAnnotationAssets(annotationModels, this._sdk);

    return await annotationAssets;
  }

  private async get360ImagesFileIds(siteId: string): Promise<number[]> {
    const filter: FileFilterProps = {
      metadata: { site_id: siteId }
    };
    const fileIds = await this.listFileIds(filter, this._sdk);
    return fileIds;
  }

  private async get360ImageAnnotations(fileIdsList: number[]): Promise<RevealAnnotationModel[]> {
    const annotationArray = await Promise.all(
      chunk(fileIdsList, 1000).map(async (fileIdsChunk) => {
        const filter: AnnotationFilterProps = {
          annotatedResourceIds: fileIdsChunk.map((id) => ({ id })),
          annotatedResourceType: 'file',
          annotationType: 'images.AssetLink'
        };
        const annotationModels = await this._sdk.annotations
          .list({
            filter,
            limit: 1000
          })
          .autoPagingToArray({ limit: Infinity });
        assert(
          annotationModels.every(
            (annotationModel) => annotationModel.annotationType === 'images.AssetLink'
          )
        );
        const filteredAnnotationModelsByAsset = annotationModels.filter((annotation) => {
          return getAssetIdOrExternalIdFromAnnotation(annotation) !== undefined;
        });
        return filteredAnnotationModelsByAsset as RevealAnnotationModel[];
      })
    );

    return annotationArray.flatMap((annotations) => annotations);
  }

  private async listFileIds(filter: FileFilterProps, sdk: CogniteClient): Promise<number[]> {
    const req = { filter, limit: 1000 };
    const map = await sdk.files.list(req).autoPagingToArray({ limit: Infinity });

    const fileInfo = await Promise.all(map.flat());
    const list = fileInfo.map((file) => file.id);

    return list;
  }
}
