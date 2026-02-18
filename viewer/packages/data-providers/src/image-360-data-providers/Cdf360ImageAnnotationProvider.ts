/*!
 * Copyright 2022 Cognite AS
 */

import chunk from 'lodash/chunk';

import {
  AnnotationModel,
  CogniteClient,
  IdEither,
  AnnotationFilterProps,
  InternalId,
  ExternalId,
  AnnotationsTypesImagesAssetLink
} from '@cognite/sdk';
import {
  Image360AnnotationFilterDelegate,
  Image360AnnotationProvider,
  Image360AnnotationSpecifier,
  Image360FileDescriptor,
  ImageAssetLinkAnnotationInfo,
  ImageInstanceLinkAnnotationInfo,
  InstanceReference
} from '../types';
import { getExternalIdFromDescriptor } from '../utilities/getExternalIdFromDescriptor';
import { ClassicDataSourceType, DataSourceType, DMDataSourceType, isSameDMIdentifier } from '../DataSourceType';
import {
  AssetAnnotationImage360Info,
  AssetHybridAnnotationImage360Info,
  createCollectionIdString,
  DefaultImage360Collection,
  Image360AnnotationAssetQueryResult,
  Image360Entity,
  Image360RevisionEntity
} from '@reveal/360-images';
import { isDmIdentifier } from '@reveal/utilities';
import {
  isAnnotationsTypesImagesInstanceLink,
  isAssetLinkAnnotationData,
  isImageAssetLinkAnnotation,
  isImageInstanceLinkAnnotation
} from '@reveal/360-images/src/annotation/typeGuards';
import { getInstanceKey } from '../utilities/instanceIds';

/**
 * Converts file descriptors to annotation resource IDs for CDF API.
 */
function getAnnotationResourceIds(descriptors: Image360FileDescriptor[]): IdEither[] {
  return descriptors.map(desc => {
    if ('fileId' in desc && desc.fileId !== undefined) {
      return { id: desc.fileId };
    }
    const externalId = getExternalIdFromDescriptor(desc);
    if (externalId !== undefined) {
      return { externalId };
    }
    throw new Error('Invalid file descriptor: must have fileId, externalId, or instanceId');
  });
}

export class Cdf360ImageAnnotationProvider implements Image360AnnotationProvider<ClassicDataSourceType> {
  private readonly _client: CogniteClient;

  private readonly _collectionToInstanceReferenceToAnnotationMap: Map<
    string,
    Map<string, Promise<Image360AnnotationAssetQueryResult<ClassicDataSourceType>[]>>
  > = new Map();

  // Cache for all annotations at collection level
  private readonly _collectionAnnotationsCache: Map<
    string,
    Promise<ClassicDataSourceType['image360AnnotationType'][]>
  > = new Map();

  // Cache for fileId to entity/revision mapping at collection level
  private readonly _collectionFileIdMapCache: Map<
    string,
    Promise<
      Map<
        number,
        { entity: Image360Entity<ClassicDataSourceType>; revision: Image360RevisionEntity<ClassicDataSourceType> }
      >
    >
  > = new Map();

  constructor(client: CogniteClient) {
    this._client = client;
  }

  public async findImageAnnotationsForInstance(
    asset: InstanceReference<DataSourceType>,
    collection: DefaultImage360Collection<ClassicDataSourceType>
  ): Promise<Image360AnnotationAssetQueryResult<ClassicDataSourceType>[]> {
    const cachedAnnotationsPromise = this._collectionToInstanceReferenceToAnnotationMap
      .get(createCollectionIdString(collection.sourceId))
      ?.get(getInstanceKey(asset));

    if (cachedAnnotationsPromise !== undefined) {
      return cachedAnnotationsPromise;
    }

    const resultPromise = this.fetchImageAnnotationsForInstance(asset, collection);

    this.cacheResult(collection, asset, resultPromise);

    return resultPromise;
  }

  private async fetchImageAnnotationsForInstance(
    asset: InstanceReference<DataSourceType>,
    collection: DefaultImage360Collection<ClassicDataSourceType>
  ): Promise<Image360AnnotationAssetQueryResult<ClassicDataSourceType>[]> {
    const allAnnotations = await this.getAllAnnotationsForCollection(collection);

    const matchingAnnotationIds = new Set<number>();
    for (const annotation of allAnnotations) {
      const annotationData = annotation.data;
      let matches = false;
      if (isDmIdentifier(asset)) {
        if (isAnnotationsTypesImagesInstanceLink(annotationData)) {
          matches = isSameDMIdentifier(annotationData.instanceRef, asset);
        }
      } else {
        if (isAssetLinkAnnotationData(annotationData)) {
          matches = matchesAssetRef(annotationData, asset);
        }
      }
      if (matches) {
        matchingAnnotationIds.add(annotation.id);
      }
    }

    if (matchingAnnotationIds.size === 0) {
      return [];
    }

    const fileIdToEntityRevision = await this.getFileIdToEntityRevisionMap(collection, allAnnotations);

    const revisionsWithMatches = new Set<Image360RevisionEntity<ClassicDataSourceType>>();
    for (const annotation of allAnnotations) {
      if (matchingAnnotationIds.has(annotation.id)) {
        const match = fileIdToEntityRevision.get(annotation.annotatedResourceId);
        if (match !== undefined) {
          revisionsWithMatches.add(match.revision);
        }
      }
    }

    const results: Image360AnnotationAssetQueryResult<ClassicDataSourceType>[] = [];

    for (const revision of revisionsWithMatches) {
      const entity = collection.image360Entities.find(e => e.getRevisions().includes(revision));
      if (entity === undefined) {
        continue;
      }

      const revisionAnnotations = await revision.getAnnotations();

      for (const annotationObj of revisionAnnotations) {
        if (matchingAnnotationIds.has(annotationObj.annotation.id)) {
          results.push({
            image: entity,
            revision: revision,
            annotation: annotationObj
          });
        }
      }
    }

    return results;
  }

  /**
   * Gets all annotations for a collection
   */
  private getAllAnnotationsForCollection(
    collection: DefaultImage360Collection<ClassicDataSourceType>
  ): Promise<ClassicDataSourceType['image360AnnotationType'][]> {
    const cacheKey = createCollectionIdString(collection.sourceId);

    const cached = this._collectionAnnotationsCache.get(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    // Fetch all annotations and cache the promise
    const fetchPromise = this.fetchAllAnnotations(collection, () => true);
    this._collectionAnnotationsCache.set(cacheKey, fetchPromise);
    return fetchPromise;
  }

  /**
   * Gets the fileId to entity/revision mapping
   */
  private getFileIdToEntityRevisionMap(
    collection: DefaultImage360Collection<ClassicDataSourceType>,
    allAnnotations: ClassicDataSourceType['image360AnnotationType'][]
  ): Promise<
    Map<
      number,
      { entity: Image360Entity<ClassicDataSourceType>; revision: Image360RevisionEntity<ClassicDataSourceType> }
    >
  > {
    const cacheKey = createCollectionIdString(collection.sourceId);

    const cached = this._collectionFileIdMapCache.get(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    // Build mapping and cache the promise
    const buildPromise = this.buildFileIdToEntityRevisionMap(collection, allAnnotations);
    this._collectionFileIdMapCache.set(cacheKey, buildPromise);
    return buildPromise;
  }

  private cacheResult(
    collection: DefaultImage360Collection<ClassicDataSourceType>,
    assetReference: InstanceReference<DataSourceType>,
    resultPromise: Promise<Image360AnnotationAssetQueryResult<ClassicDataSourceType>[]>
  ): void {
    let collectionMap = this._collectionToInstanceReferenceToAnnotationMap.get(
      createCollectionIdString(collection.sourceId)
    );

    if (collectionMap === undefined) {
      collectionMap = new Map();
      this._collectionToInstanceReferenceToAnnotationMap.set(
        createCollectionIdString(collection.sourceId),
        collectionMap
      );
    }

    collectionMap.set(getInstanceKey(assetReference), resultPromise);
  }

  public async getRelevant360ImageAnnotations(
    annotationSpecifier: Image360AnnotationSpecifier<ClassicDataSourceType>
  ): Promise<ClassicDataSourceType['image360AnnotationType'][]> {
    const resourceIds = getAnnotationResourceIds(annotationSpecifier.fileDescriptors);

    return this.listFileAnnotations({
      annotatedResourceType: 'file',
      annotatedResourceIds: resourceIds
    });
  }

  /**
   * Fetches file info for the given IDs and returns a map of fileId -> externalId.
   */
  private async fetchFileIdToExternalIdMapping(
    fileIds: number[],
    allowedExternalIds: Set<string>
  ): Promise<Map<number, string>> {
    const result = new Map<number, string>();

    if (fileIds.length === 0 || allowedExternalIds.size === 0) {
      return result;
    }

    const fileInfos = await this._client.files.retrieve(fileIds.map(id => ({ id })));

    for (const fileInfo of fileInfos) {
      if (fileInfo.externalId !== undefined && allowedExternalIds.has(fileInfo.externalId)) {
        result.set(fileInfo.id, fileInfo.externalId);
      }
    }

    return result;
  }

  /**
   * Resolves the mapping from internal file IDs to external IDs.
   * This is needed to match annotations (which have annotatedResourceId) to descriptors (which may have externalId).
   */
  public async resolveFileIdToExternalIdMapping(
    annotations: AnnotationModel[],
    descriptors: Image360FileDescriptor[]
  ): Promise<Map<number, string>> {
    const fileIdToExternalId = new Map<number, string>();
    const descriptorExternalIds = new Set<string>();

    for (const desc of descriptors) {
      const externalId = getExternalIdFromDescriptor(desc);
      if (externalId !== undefined) {
        descriptorExternalIds.add(externalId);
        if ('fileId' in desc && desc.fileId !== undefined) {
          fileIdToExternalId.set(desc.fileId, externalId);
        }
      }
    }

    const unmappedIds = [...new Set(annotations.map(a => a.annotatedResourceId))].filter(
      id => !fileIdToExternalId.has(id)
    );

    const fetchedMappings = await this.fetchFileIdToExternalIdMapping(unmappedIds, descriptorExternalIds);
    for (const [fileId, externalId] of fetchedMappings) {
      fileIdToExternalId.set(fileId, externalId);
    }

    return fileIdToExternalId;
  }

  getAllImage360AnnotationInfos(
    source: 'assets',
    collection: DefaultImage360Collection<ClassicDataSourceType>,
    annotationFilter: Image360AnnotationFilterDelegate<ClassicDataSourceType>
  ): Promise<AssetAnnotationImage360Info<ClassicDataSourceType>[]>;
  getAllImage360AnnotationInfos(
    source: 'hybrid',
    collection: DefaultImage360Collection<ClassicDataSourceType>,
    annotationFilter: Image360AnnotationFilterDelegate<ClassicDataSourceType>
  ): Promise<AssetHybridAnnotationImage360Info[]>;
  getAllImage360AnnotationInfos(
    source: 'cdm',
    collection: DefaultImage360Collection<ClassicDataSourceType>,
    annotationFilter: Image360AnnotationFilterDelegate<ClassicDataSourceType>
  ): Promise<AssetAnnotationImage360Info<DMDataSourceType>[]>;
  getAllImage360AnnotationInfos(
    source: 'all',
    collection: DefaultImage360Collection<ClassicDataSourceType>,
    annotationFilter: Image360AnnotationFilterDelegate<ClassicDataSourceType>
  ): Promise<AssetAnnotationImage360Info<DataSourceType>[]>;
  public async getAllImage360AnnotationInfos(
    source: 'all' | 'assets' | 'hybrid' | 'cdm',
    collection: DefaultImage360Collection<ClassicDataSourceType>,
    annotationFilter: Image360AnnotationFilterDelegate<ClassicDataSourceType>
  ): Promise<
    | AssetAnnotationImage360Info<ClassicDataSourceType>[]
    | AssetAnnotationImage360Info<DMDataSourceType>[]
    | AssetAnnotationImage360Info<DataSourceType>[]
    | AssetHybridAnnotationImage360Info[]
  > {
    if (source === 'cdm') {
      return [];
    }
    const allAnnotations = await this.getAllAnnotationsForCollection(collection);
    const annotations = allAnnotations.filter(annotationFilter);
    const fileIdToEntityRevision = await this.getFileIdToEntityRevisionMap(collection, allAnnotations);

    if (source === 'hybrid') {
      return pairAnnotationsWithEntityAndRevision(
        annotations.filter(
          annotation => isImageInstanceLinkAnnotation(annotation) || isImageAssetLinkAnnotation(annotation)
        )
      );
    }
    return pairAnnotationsWithEntityAndRevision(
      annotations.filter(annotation => isImageAssetLinkAnnotation(annotation))
    );

    function pairAnnotationsWithEntityAndRevision(
      annotations: Array<ImageAssetLinkAnnotationInfo | ImageInstanceLinkAnnotationInfo>
    ) {
      return annotations
        .map(annotation => {
          const entityRevisionObject = fileIdToEntityRevision.get(annotation.annotatedResourceId);

          if (entityRevisionObject === undefined) {
            return undefined;
          }

          const { entity, revision } = entityRevisionObject;

          return { annotationInfo: annotation, imageEntity: entity, imageRevision: revision };
        })
        .filter(info => info !== undefined);
    }
  }

  /**
   * Builds a mapping from annotatedResourceId (internal file ID) to entity/revision.
   * For legacy descriptors with fileId, uses the fileId directly.
   * For new descriptors with externalId, resolves the mapping via one batched API call.
   */
  private async buildFileIdToEntityRevisionMap(
    collection: DefaultImage360Collection<ClassicDataSourceType>,
    annotations: AnnotationModel[]
  ): Promise<
    Map<
      number,
      { entity: Image360Entity<ClassicDataSourceType>; revision: Image360RevisionEntity<ClassicDataSourceType> }
    >
  > {
    type EntityRevision = {
      entity: Image360Entity<ClassicDataSourceType>;
      revision: Image360RevisionEntity<ClassicDataSourceType>;
    };
    const fileIdToEntityRevision = new Map<number, EntityRevision>();
    const externalIdToEntityRevision = new Map<string, EntityRevision>();

    for (const entity of collection.image360Entities) {
      for (const revision of entity.getRevisions()) {
        for (const descriptor of revision.getDescriptors().faceDescriptors) {
          const entityRevision = { entity, revision };

          if ('fileId' in descriptor && descriptor.fileId !== undefined) {
            fileIdToEntityRevision.set(descriptor.fileId, entityRevision);
          }

          const externalId = getExternalIdFromDescriptor(descriptor);
          if (externalId !== undefined) {
            externalIdToEntityRevision.set(externalId, entityRevision);
          }
        }
      }
    }

    const unmappedIds = [...new Set(annotations.map(a => a.annotatedResourceId))].filter(
      id => !fileIdToEntityRevision.has(id)
    );

    const allowedExternalIds = new Set(externalIdToEntityRevision.keys());
    const fileIdToExternalId = await this.fetchFileIdToExternalIdMapping(unmappedIds, allowedExternalIds);

    for (const [fileId, externalId] of fileIdToExternalId) {
      const match = externalIdToEntityRevision.get(externalId);
      if (match !== undefined) {
        fileIdToEntityRevision.set(fileId, match);
      }
    }

    return fileIdToEntityRevision;
  }

  private async fetchAllAnnotations(
    collection: DefaultImage360Collection<ClassicDataSourceType>,
    annotationFilter: Image360AnnotationFilterDelegate<ClassicDataSourceType>
  ): Promise<ClassicDataSourceType['image360AnnotationType'][]> {
    const image360FileDescriptors = collection.getAllFileDescriptors();
    const resourceIds = getAnnotationResourceIds(image360FileDescriptors);

    const assetListPromises = chunk(resourceIds, 1000).map(async idList => {
      const annotationArray = await this.listFileAnnotations({
        annotatedResourceIds: idList,
        annotatedResourceType: 'file'
      });

      const assetAnnotations = annotationArray.filter(annotationFilter);

      return assetAnnotations;
    });

    return (await Promise.all(assetListPromises)).flat();
  }

  private async listFileAnnotations(filter: AnnotationFilterProps): Promise<AnnotationModel[]> {
    return this._client.annotations
      .list({
        limit: 1000,
        filter
      })
      .autoPagingToArray({ limit: Infinity });
  }
}

function matchesAssetRef(assetLink: AnnotationsTypesImagesAssetLink, matchRef: IdEither): boolean {
  return (
    ((matchRef as InternalId).id !== undefined && assetLink.assetRef.id === (matchRef as InternalId).id) ||
    ((matchRef as ExternalId).externalId !== undefined &&
      assetLink.assetRef.externalId === (matchRef as ExternalId).externalId)
  );
}
