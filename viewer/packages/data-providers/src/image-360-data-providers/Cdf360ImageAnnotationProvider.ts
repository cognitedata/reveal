/*!
 * Copyright 2022 Cognite AS
 */

import chunk from 'lodash/chunk';

import {
  AnnotationModel,
  CogniteClient,
  IdEither,
  CogniteInternalId,
  AnnotationFilterProps,
  AnnotationsAssetRef,
  InternalId,
  ExternalId,
  AnnotationsTypesImagesAssetLink
} from '@cognite/sdk';
import {
  Image360AnnotationFilterDelegate,
  Image360AnnotationProvider,
  Image360AnnotationSpecifier,
  InstanceReference
} from '../types';
import { ClassicDataSourceType, DataSourceType, DMDataSourceType } from '../DataSourceType';
import {
  AssetAnnotationImage360Info,
  DefaultImage360Collection,
  Image360Annotation,
  Image360AnnotationAssetQueryResult,
  Image360Entity,
  Image360RevisionEntity
} from '@reveal/360-images';
import { isImageAssetLinkAnnotation, isImageInstanceLinkAnnotation } from './shared';
import { InstanceLinkable360ImageAnnotationType } from '@reveal/360-images';

export class Cdf360ImageAnnotationProvider implements Image360AnnotationProvider<ClassicDataSourceType> {
  private readonly _client: CogniteClient;

  constructor(client: CogniteClient) {
    this._client = client;
  }

  public async findImageAnnotationsForInstance(
    asset: InstanceReference<ClassicDataSourceType>,
    collection: DefaultImage360Collection<ClassicDataSourceType>
  ): Promise<Image360AnnotationAssetQueryResult<ClassicDataSourceType>[]> {
    const entities = collection.image360Entities;
    const imageIds = await this.getFilesByAssetRef(asset);
    const imageIdSet = new Set<CogniteInternalId>(imageIds);

    const entityAnnotationsPromises = entities.map(getEntityAnnotationsForAsset);
    const entityAnnotations = await Promise.all(entityAnnotationsPromises);
    return entityAnnotations.flat();

    async function getEntityAnnotationsForAsset(
      entity: Image360Entity<ClassicDataSourceType>
    ): Promise<Image360AnnotationAssetQueryResult[]> {
      const revisionPromises = entity.getRevisions().map(async revision => {
        const annotations = await getRevisionAnnotationsForAsset(revision);

        return annotations.map(annotation => ({ image: entity, revision, annotation }));
      });

      const revisionMatches = await Promise.all(revisionPromises);
      return revisionMatches.flat();
    }

    async function getRevisionAnnotationsForAsset(
      revision: Image360RevisionEntity<ClassicDataSourceType>
    ): Promise<Image360Annotation<ClassicDataSourceType>[]> {
      const relevantDescriptors = revision.getDescriptors().faceDescriptors.filter(desc => imageIdSet.has(desc.fileId));

      if (relevantDescriptors.length === 0) {
        return [];
      }

      const annotations = await revision.getAnnotations();

      return annotations.filter(a => {
        const assetLink = a.annotation.data as AnnotationsTypesImagesAssetLink;
        return assetLink.assetRef !== undefined && matchesAssetRef(assetLink, asset);
      });
    }
  }

  public async getRelevant360ImageAnnotations(
    annotationSpecifier: Image360AnnotationSpecifier<ClassicDataSourceType>
  ): Promise<ClassicDataSourceType['image360AnnotationType'][]> {
    const fileIds = annotationSpecifier.fileDescriptors.map(o => ({ id: o.fileId }));

    return this.listFileAnnotations({
      annotatedResourceType: 'file',
      annotatedResourceIds: fileIds
    });
  }

  private async getFilesByAssetRef(assetRef: IdEither): Promise<CogniteInternalId[]> {
    const response = await this._client.annotations
      .reverseLookup({
        limit: 1000,
        filter: {
          annotatedResourceType: 'file',
          annotationType: 'images.AssetLink',
          data: {
            assetRef
          }
        }
      })
      .autoPagingToArray();

    return response.map((a: AnnotationsAssetRef) => a.id).filter((id): id is number => id !== undefined);
  }

  getAllImage360AnnotationInfos(
    source: 'assets',
    collection: DefaultImage360Collection<ClassicDataSourceType>,
    annotationFilter: Image360AnnotationFilterDelegate<ClassicDataSourceType>
  ): Promise<AssetAnnotationImage360Info<ClassicDataSourceType>[]>;
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
    source: 'all' | 'assets' | 'cdm',
    collection: DefaultImage360Collection<ClassicDataSourceType>,
    annotationFilter: Image360AnnotationFilterDelegate<ClassicDataSourceType>
  ): Promise<
    | AssetAnnotationImage360Info<ClassicDataSourceType>[]
    | AssetAnnotationImage360Info<DMDataSourceType>[]
    | AssetAnnotationImage360Info<DataSourceType>[]
  > {
    if (source === 'cdm') {
      return [];
    }
    const fileIdToEntityRevision = this.createFileIdToEntityRevisionMap(collection);
    const annotations = await this.fetchAllAnnotations(collection, annotationFilter);

    return pairAnnotationsWithEntityAndRevision(
      annotations.filter(
        annotation => isImageAssetLinkAnnotation(annotation) || isImageInstanceLinkAnnotation(annotation)
      )
    );

    function pairAnnotationsWithEntityAndRevision(
      annotations: InstanceLinkable360ImageAnnotationType<ClassicDataSourceType>[]
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

  private createFileIdToEntityRevisionMap(
    collection: DefaultImage360Collection<ClassicDataSourceType>
  ): Map<
    number,
    { entity: Image360Entity<ClassicDataSourceType>; revision: Image360RevisionEntity<ClassicDataSourceType> }
  > {
    return collection.image360Entities.reduce((map, entity) => {
      entity.getRevisions().forEach(revision => {
        const descriptors = revision.getDescriptors().faceDescriptors;
        descriptors.forEach(descriptor => map.set(descriptor.fileId, { entity, revision }));
      });
      return map;
    }, new Map<number, { entity: Image360Entity<ClassicDataSourceType>; revision: Image360RevisionEntity<ClassicDataSourceType> }>());
  }

  private async fetchAllAnnotations(
    collection: DefaultImage360Collection<ClassicDataSourceType>,
    annotationFilter: Image360AnnotationFilterDelegate<ClassicDataSourceType>
  ): Promise<ClassicDataSourceType['image360AnnotationType'][]> {
    const image360FileDescriptors = collection.getAllFileDescriptors();
    const fileIds = image360FileDescriptors.map(desc => desc.fileId);
    const assetListPromises = chunk(fileIds, 1000).map(async idList => {
      const annotationArray = await this.listFileAnnotations({
        annotatedResourceIds: idList.map(id => ({ id })),
        annotatedResourceType: 'file',
        annotationType: 'images.AssetLink'
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
