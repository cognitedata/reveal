/*!
 * Copyright 2026 Cognite AS
 */
import type {
  ClassicDataSourceType,
  DataSourceType,
  DMDataSourceType,
  Image360RevisionId,
  Image360FileDescriptor
} from '@reveal/data-providers';
import type {
  AssetAnnotationImage360Info,
  AssetHybridAnnotationImage360Info,
  Image360AnnotationAssetQueryResult
} from '../collection/Image360Collection';
import type { DefaultImage360Collection } from '../collection/DefaultImage360Collection';
import type { Image360AnnotationInstanceReference } from '../annotation/types';

export type Image360AnnotationFilterDelegate<T extends DataSourceType> = (
  annotation: T['image360AnnotationType']
) => boolean;

export type Image360AnnotationSpecifier<T extends DataSourceType> = {
  revisionId: Image360RevisionId<T>;
  fileDescriptors: Image360FileDescriptor[];
};

export interface Image360AnnotationProvider<T extends DataSourceType> {
  getRelevant360ImageAnnotations(
    annotationSpecifier: Image360AnnotationSpecifier<T>
  ): Promise<T['image360AnnotationType'][]>;

  /**
   * Resolves the mapping from internal file IDs (annotatedResourceId) to external IDs.
   * This is needed to match annotations to face descriptors when descriptors use externalId.
   * Optional - if not implemented, the caller should build mapping from descriptors only.
   */
  resolveFileIdToExternalIdMapping?(
    annotations: T['image360AnnotationType'][],
    descriptors: Image360FileDescriptor[]
  ): Promise<Map<number, string>>;

  findImageAnnotationsForInstance(
    instanceFilter: Image360AnnotationInstanceReference<T>,
    collection: DefaultImage360Collection<T>
  ): Promise<Image360AnnotationAssetQueryResult<T>[]>;

  getAllImage360AnnotationInfos(
    source: 'assets',
    collection: DefaultImage360Collection<T>,
    annotationFilter: Image360AnnotationFilterDelegate<T>
  ): Promise<AssetAnnotationImage360Info<ClassicDataSourceType>[]>;
  getAllImage360AnnotationInfos(
    source: 'hybrid',
    collection: DefaultImage360Collection<T>,
    annotationFilter: Image360AnnotationFilterDelegate<T>
  ): Promise<AssetHybridAnnotationImage360Info[]>;
  getAllImage360AnnotationInfos(
    source: 'cdm',
    collection: DefaultImage360Collection<T>,
    annotationFilter: Image360AnnotationFilterDelegate<T>
  ): Promise<AssetAnnotationImage360Info<DMDataSourceType>[]>;
  getAllImage360AnnotationInfos(
    source: 'all',
    collection: DefaultImage360Collection<T>,
    annotationFilter: Image360AnnotationFilterDelegate<T>
  ): Promise<AssetAnnotationImage360Info<DataSourceType>[]>;
  getAllImage360AnnotationInfos(
    source: 'assets' | 'hybrid' | 'cdm' | 'all',
    collection: DefaultImage360Collection<T>,
    annotationFilter: Image360AnnotationFilterDelegate<T>
  ): Promise<
    | AssetAnnotationImage360Info<ClassicDataSourceType>[]
    | AssetAnnotationImage360Info<DMDataSourceType>[]
    | AssetAnnotationImage360Info<DataSourceType>[]
    | AssetHybridAnnotationImage360Info[]
  >;
}
