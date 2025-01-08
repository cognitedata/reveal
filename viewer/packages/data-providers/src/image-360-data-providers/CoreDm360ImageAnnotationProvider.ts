/*!
 * Copyright 2025 Cognite AS
 */
import { CoreDMDataSourceType } from '../DataSourceType';
import {
  Image360AnnotationFilterDelegate,
  Image360AnnotationProvider,
  Image360AnnotationSpecifier,
  InstanceReference
} from '../types';
import { Image360AnnotationAssetQueryResult } from 'api-entry-points/core';
import {
  AssetAnnotationImage360Info,
  DefaultImage360Collection,
  Image360Entity,
  Image360RevisionEntity
} from '@reveal/360-images';
import { isSameImage360RevisionId } from './shared';
import { fetchCoreDm360AnnotationsForRevision } from './cdm/fetchCoreDm360AnnotationsForRevision';
import { CogniteClient } from '@cognite/sdk';
import { fetchAnnotationsForInstance } from './cdm/fetchAnnotationsForInstance';
import { fetchCoreDm360AnnotationsForCollection } from './cdm/fetchCoreDm360AnnotationsForCollection';
import { DMInstanceKey, dmInstanceRefToKey } from '@reveal/utilities';

export class CoreDm360ImageAnnotationProvider implements Image360AnnotationProvider<CoreDMDataSourceType> {
  private readonly _client: CogniteClient;

  constructor(client: CogniteClient) {
    this._client = client;
  }

  async getRelevant360ImageAnnotations(
    annotationSpecifier: Image360AnnotationSpecifier<CoreDMDataSourceType>
  ): Promise<CoreDMDataSourceType['image360AnnotationType'][]> {
    return fetchCoreDm360AnnotationsForRevision(annotationSpecifier.revisionId, this._client);
  }

  async findImageAnnotationsForInstance(
    instanceFilter: InstanceReference<CoreDMDataSourceType>,
    collection: DefaultImage360Collection<CoreDMDataSourceType>
  ): Promise<Image360AnnotationAssetQueryResult<CoreDMDataSourceType>[]> {
    const relatedRevisionsAndAnnotations = await fetchAnnotationsForInstance(instanceFilter, this._client);
    const entities = collection.image360Entities;
    return (await Promise.all(entities.map(getRevisionAnnotationsForEntity))).flat();

    async function getRevisionAnnotationsForEntity(
      entity: Image360Entity<CoreDMDataSourceType>
    ): Promise<Image360AnnotationAssetQueryResult<CoreDMDataSourceType>[]> {
      const revisions = entity
        .getRevisions()
        .filter(
          revision =>
            relatedRevisionsAndAnnotations.imageRevisionIds.find(foundRevisionId =>
              isSameImage360RevisionId(revision.identifier, foundRevisionId)
            ) !== undefined
        );
      return (await Promise.all(revisions.map(revision => getAnnotationInfoForRevision(entity, revision)))).flat();
    }

    async function getAnnotationInfoForRevision(
      entity: Image360Entity<CoreDMDataSourceType>,
      revision: Image360RevisionEntity<CoreDMDataSourceType>
    ): Promise<Image360AnnotationAssetQueryResult<CoreDMDataSourceType>[]> {
      const annotations = await revision.getAnnotations();
      return annotations.map(annotation => ({
        image: entity,
        revision,
        annotation
      }));
    }
  }

  async getAllImage360AnnotationInfos(
    collection: DefaultImage360Collection<CoreDMDataSourceType>,
    annotationFilter: Image360AnnotationFilterDelegate<CoreDMDataSourceType>
  ): Promise<AssetAnnotationImage360Info<CoreDMDataSourceType>[]> {
    const annotations = (
      await fetchCoreDm360AnnotationsForCollection(
        { externalId: collection.collectionId.image360CollectionExternalId, space: collection.collectionId.space },
        this._client
      )
    ).filter(annotationFilter);

    const entities = collection.image360Entities;
    const revisionIdToEntityAndRevisionMap = new Map<
      DMInstanceKey,
      [Image360Entity<CoreDMDataSourceType>, Image360RevisionEntity<CoreDMDataSourceType>]
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
