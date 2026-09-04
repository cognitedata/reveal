/*!
 * Copyright 2025 Cognite AS
 */
import type {
  ClassicDataSourceType,
  DataSourceType,
  DMDataSourceType,
  InstanceReference,
  Image360AnnotationsForInstanceResult
} from '@reveal/data-providers';
import {
  isSameDMIdentifier,
  isSameImage360RevisionId,
  fetchCoreDm360AnnotationsForRevision,
  fetchAnnotationsForInstance,
  fetchCoreDm360AnnotationsForCollection
} from '@reveal/data-providers';
import type {
  Image360AnnotationFilterDelegate,
  Image360AnnotationProvider,
  Image360AnnotationSpecifier
} from './Image360AnnotationProvider';
import type {
  AssetAnnotationImage360Info,
  AssetHybridAnnotationImage360Info,
  Image360AnnotationAssetQueryResult
} from '../collection/Image360Collection';
import type { DefaultImage360Collection } from '../collection/DefaultImage360Collection';
import type { Image360Entity } from '../entity/Image360Entity';
import type { Image360RevisionEntity } from '../entity/Image360RevisionEntity';
import type { CogniteClient } from '@cognite/sdk';
import type { DMInstanceKey } from '@reveal/utilities';
import { dmInstanceRefToKey } from '@reveal/utilities';

export class CoreDm360ImageAnnotationProvider implements Image360AnnotationProvider<DMDataSourceType> {
  private readonly _client: CogniteClient;

  constructor(client: CogniteClient) {
    this._client = client;
  }

  async getRelevant360ImageAnnotations(
    annotationSpecifier: Image360AnnotationSpecifier<DMDataSourceType>
  ): Promise<DMDataSourceType['image360AnnotationType'][]> {
    return fetchCoreDm360AnnotationsForRevision(annotationSpecifier.revisionId, this._client);
  }

  async findImageAnnotationsForInstance(
    instanceFilter: InstanceReference<DMDataSourceType>,
    collection: DefaultImage360Collection<DMDataSourceType>
  ): Promise<Image360AnnotationAssetQueryResult<DMDataSourceType>[]> {
    const relatedRevisionsAndAnnotations = await fetchAnnotationsForInstance(instanceFilter, this._client);
    const entities = collection.image360Entities;
    return (await Promise.all(entities.map(getRevisionAnnotationsForEntity))).flat();

    async function getRevisionAnnotationsForEntity(
      entity: Image360Entity<DMDataSourceType>
    ): Promise<Image360AnnotationAssetQueryResult<DMDataSourceType>[]> {
      const revisions = entity
        .getRevisions()
        .filter(revision =>
          relatedRevisionsAndAnnotations.imageRevisionIds.some(foundRevisionId =>
            isSameImage360RevisionId(revision.identifier, foundRevisionId)
          )
        );
      return (
        await Promise.all(
          revisions.map(revision => getAnnotationInfoForRevision(entity, revision, relatedRevisionsAndAnnotations))
        )
      ).flat();
    }

    async function getAnnotationInfoForRevision(
      entity: Image360Entity<DMDataSourceType>,
      revision: Image360RevisionEntity<DMDataSourceType>,
      relatedRevisionsAndAnnotations: Image360AnnotationsForInstanceResult
    ): Promise<Image360AnnotationAssetQueryResult<DMDataSourceType>[]> {
      const annotations = await revision.getAnnotations();
      const filteredAnnotations = annotations.filter(annotation =>
        relatedRevisionsAndAnnotations.annotationIds.some(relatedRevisionAnnotationId =>
          isSameDMIdentifier(relatedRevisionAnnotationId, annotation.annotation.annotationIdentifier)
        )
      );
      return filteredAnnotations.map(annotation => ({
        image: entity,
        revision,
        annotation
      }));
    }
  }

  getAllImage360AnnotationInfos(
    source: 'assets',
    collection: DefaultImage360Collection<DMDataSourceType>,
    annotationFilter: Image360AnnotationFilterDelegate<DMDataSourceType>
  ): Promise<AssetAnnotationImage360Info<ClassicDataSourceType>[]>;
  getAllImage360AnnotationInfos(
    source: 'hybrid',
    collection: DefaultImage360Collection<DMDataSourceType>,
    annotationFilter: Image360AnnotationFilterDelegate<DMDataSourceType>
  ): Promise<AssetHybridAnnotationImage360Info[]>;
  getAllImage360AnnotationInfos(
    source: 'cdm',
    collection: DefaultImage360Collection<DMDataSourceType>,
    annotationFilter: Image360AnnotationFilterDelegate<DMDataSourceType>
  ): Promise<AssetAnnotationImage360Info<DMDataSourceType>[]>;
  getAllImage360AnnotationInfos(
    source: 'all',
    collection: DefaultImage360Collection<DMDataSourceType>,
    annotationFilter: Image360AnnotationFilterDelegate<DMDataSourceType>
  ): Promise<AssetAnnotationImage360Info<DataSourceType>[]>;
  public async getAllImage360AnnotationInfos(
    source: 'all' | 'assets' | 'hybrid' | 'cdm',
    collection: DefaultImage360Collection<DMDataSourceType>,
    annotationFilter: Image360AnnotationFilterDelegate<DMDataSourceType>
  ): Promise<
    | AssetAnnotationImage360Info<ClassicDataSourceType>[]
    | AssetAnnotationImage360Info<DMDataSourceType>[]
    | AssetAnnotationImage360Info<DataSourceType>[]
    | AssetHybridAnnotationImage360Info[]
  > {
    if (source !== 'cdm' && source !== 'all') {
      return [];
    }

    const annotations = (
      await fetchCoreDm360AnnotationsForCollection(
        { externalId: collection.sourceId.image360CollectionExternalId, space: collection.sourceId.space },
        this._client
      )
    ).filter(annotationFilter);

    const entities = collection.image360Entities;
    const revisionIdToEntityAndRevisionMap = new Map<
      DMInstanceKey,
      [Image360Entity<DMDataSourceType>, Image360RevisionEntity<DMDataSourceType>]
    >(
      entities.flatMap(entity =>
        entity.getRevisions().map(revision => [dmInstanceRefToKey(revision.identifier), [entity, revision]])
      )
    );

    return annotations
      .map(annotation => {
        const revisionKey = dmInstanceRefToKey(annotation.connectedImageId);
        const entityRevisionPair = revisionIdToEntityAndRevisionMap.get(revisionKey);

        if (entityRevisionPair === undefined) {
          return undefined;
        }

        const [entity, revision] = entityRevisionPair;

        return { annotationInfo: annotation, imageEntity: entity, imageRevision: revision };
      })
      .filter(result => result !== undefined);
  }
}
