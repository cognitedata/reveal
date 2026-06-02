/*!
 * Copyright 2026 Cognite AS
 */
import { AnnotationModel, CogniteClient, FileInfo, IdEither, InternalId } from '@cognite/sdk';
import { InstanceReference } from '../types';
import { DataSourceType } from '../DataSourceType';
import { getInstanceKey } from '../utilities/instanceIds';
import { isDefined, isDmIdentifier } from '@reveal/utilities';
import chunk from 'lodash/chunk';
import groupBy from 'lodash/groupBy';
import partition from 'lodash/partition';

export class Cdf360ImageAnnotationCache {
  private readonly _instanceKeyToAnnotations: Map<string, Promise<AnnotationModel[]>> = new Map();
  private readonly _fileIdToAnnotation: Map<number, Promise<AnnotationModel[]>> = new Map();
  private readonly _fileIdToFileInfo: Map<string, Promise<FileInfo>> = new Map();

  constructor(private readonly _sdk: CogniteClient) {}

  public async reverseLookup(assetId: InstanceReference<DataSourceType>): Promise<AnnotationModel[]> {
    const key = getInstanceKey(assetId);
    const cachedResult = this._instanceKeyToAnnotations.get(key);
    if (cachedResult !== undefined) {
      return cachedResult;
    }

    const fileIds = await this.fetchAnnotatedFilesForAsset(assetId);
    const annotations = this.getAnnotationsForFiles(fileIds);

    this._instanceKeyToAnnotations.set(key, annotations);

    return annotations;
  }

  private async fetchAnnotatedFilesForAsset(assetId: InstanceReference<DataSourceType>): Promise<InternalId[]> {
    const annotationType = isDmIdentifier(assetId) ? 'images.InstanceLink' : 'images.AssetLink';
    const dataFilter = getReverseLookupDataFilter(assetId);

    const fileRefs = await this._sdk.annotations
      .reverseLookup({
        filter: {
          annotatedResourceType: 'file',
          annotationType,
          data: dataFilter
        },
        limit: 1000
      })
      .autoPagingToArray({ limit: Infinity });

    // Annotation API always returns internal IDs for annotated resources
    return fileRefs.map(ref => (ref.id !== undefined ? { id: ref.id } : undefined)).filter(isDefined);
  }

  public async getAnnotationsForFiles(fileIds: InternalId[]): Promise<AnnotationModel[]> {
    const [cachedFileIds, uncachedFileIds] = partition(fileIds, id => this._fileIdToAnnotation.has(id.id));
    const cachedResultPromises = cachedFileIds.map(id => this._fileIdToAnnotation.get(id.id)).filter(isDefined);

    const fetchedAnnotationsResult = this.fetchAnnotationsForFiles(uncachedFileIds);

    this.cacheAnnotationsForFiles(uncachedFileIds, fetchedAnnotationsResult);

    const cachedResults = (await Promise.all(cachedResultPromises)).flat();
    const uncachedResults = await fetchedAnnotationsResult;

    return [...cachedResults, ...uncachedResults];
  }

  private cacheAnnotationsForFiles(fileIds: InternalId[], annotations: Promise<AnnotationModel[]>): void {
    const filesToAnnotationsMapPromise = annotations.then(annotations =>
      groupBy(annotations, annotation => annotation.annotatedResourceId)
    );

    fileIds.forEach(id => {
      this._fileIdToAnnotation.set(
        id.id,
        filesToAnnotationsMapPromise.then(annotationsMap => annotationsMap[id.id] ?? [])
      );
    });
  }

  private async fetchAnnotationsForFiles(allFileIds: IdEither[]): Promise<AnnotationModel[]> {
    // Process sequentially to avoid too many concurrent requests.
    const results: AnnotationModel[] = [];
    for (const fileIds of chunk(allFileIds, 1000)) {
      const filter = {
        annotatedResourceType: 'file' as const,
        annotatedResourceIds: fileIds
      };
      const batchResults = await this._sdk.annotations
        .list({
          limit: 1000,
          filter
        })
        .autoPagingToArray({ limit: Infinity });

      results.push(...batchResults);
    }

    return results;
  }

  public async getFileInfosForFileIds(fileIds: IdEither[]): Promise<FileInfo[]> {
    const [cachedIds, uncachedIds] = partition(fileIds, id => this._fileIdToFileInfo.has(getInstanceKey(id)));

    const uncachedResultBatches = this.fetchAndCacheFiles(uncachedIds);

    const cachedResultPromises = cachedIds
      .map(id => this._fileIdToFileInfo.get(getInstanceKey(id)))
      .filter(result => result !== undefined);

    const cachedResult = await Promise.all(cachedResultPromises);
    const uncachedResult = (await Promise.all(uncachedResultBatches)).flat();
    return [...cachedResult, ...uncachedResult];
  }

  private fetchAndCacheFiles(fileIds: IdEither[]): Promise<FileInfo[]>[] {
    const uncachedResultBatches: Promise<FileInfo[]>[] = [];
    for (const idChunk of chunk(fileIds, 1000)) {
      const uncachedResultBatch = this._sdk.files.retrieve(idChunk);

      this.cacheFileInfoResults(fileIds, uncachedResultBatch);
      uncachedResultBatches.push(uncachedResultBatch);
    }
    return uncachedResultBatches;
  }

  private cacheFileInfoResults(fileIds: IdEither[], resultPromise: Promise<FileInfo[]>): void {
    fileIds.forEach((id, index) =>
      this._fileIdToFileInfo.set(
        getInstanceKey(id),
        resultPromise.then(data => data[index])
      )
    );
    resultPromise.then(fileInfos =>
      fileInfos.forEach(fileInfo => {
        const internalIdKey = getInstanceKey({ id: fileInfo.id });
        if (!this._fileIdToFileInfo.has(internalIdKey)) {
          this._fileIdToFileInfo.set(internalIdKey, Promise.resolve(fileInfo));
        }

        if (
          fileInfo.externalId !== undefined &&
          !this._fileIdToFileInfo.has(getInstanceKey({ externalId: fileInfo.externalId }))
        ) {
          this._fileIdToFileInfo.set(getInstanceKey({ externalId: fileInfo.externalId }), Promise.resolve(fileInfo));
        }
      })
    );
  }
}

function getReverseLookupDataFilter(asset: InstanceReference<DataSourceType>): Record<string, unknown> {
  if (isDmIdentifier(asset)) {
    return { instanceRef: { externalId: asset.externalId, space: asset.space } };
  }
  if ('id' in asset) {
    return { assetRef: { id: asset.id } };
  }
  return { assetRef: { externalId: asset.externalId } };
}
