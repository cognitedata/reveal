/*!
 * Copyright 2021 Cognite AS
 */
export { CdfModelDataProvider } from './src/model-data-providers/CdfModelDataProvider';
export { CachedModelDataProvider } from './src/model-data-providers/CachedModelDataProvider';
export { CdfModelIdentifier } from './src/model-identifiers/CdfModelIdentifier';
export { CdfModelMetadataProvider } from './src/metadata-providers/CdfModelMetadataProvider';
export {
  type Cdf360ImageAnnotationCache,
  createCdf360ImageAnnotationCache
} from './src/image-360-data-providers/Cdf360ImageAnnotationCache';
export { Cdf360EventDescriptorProvider } from './src/image-360-data-providers/descriptor-providers/events/Cdf360EventDescriptorProvider';
export { Cdf360CdmDescriptorProvider } from './src/image-360-data-providers/descriptor-providers/datamodels/cdm/Cdf360CdmDescriptorProvider';
export { Cdf360ImageFileProvider } from './src/image-360-data-providers/Cdf360ImageFileProvider';
export type {
  Image360DataModelIdentifier,
  Image360CoreDataModelIdentifier,
  Image360LegacyDataModelIdentifier,
  Image360BaseIdentifier
} from './src/image-360-data-providers/descriptor-providers/datamodels/system-space/Cdf360DataModelsDescriptorProvider';
export { Cdf360DataModelsDescriptorProvider } from './src/image-360-data-providers/descriptor-providers/datamodels/system-space/Cdf360DataModelsDescriptorProvider';
export {
  isClassic360Identifier,
  isCoreDmImage360Identifier,
  isLegacyDM360Identifier,
  isFdm360ImageCollectionIdentifier,
  isClassicMetadata360Identifier,
  isSameImage360RevisionId
} from './src/image-360-data-providers/shared';
export { fetchCoreDm360AnnotationsForRevision } from './src/image-360-data-providers/cdm/fetchCoreDm360AnnotationsForRevision';
export {
  fetchAnnotationsForInstance,
  type Image360AnnotationsForInstanceResult
} from './src/image-360-data-providers/cdm/fetchAnnotationsForInstance';
export { fetchCoreDm360AnnotationsForCollection } from './src/image-360-data-providers/cdm/fetchCoreDm360AnnotationsForCollection';
export type { CoreDmImage360Annotation } from './src/image-360-data-providers/cdm/types';
export { LocalModelDataProvider } from './src/model-data-providers/LocalModelDataProvider';
export { LocalModelIdentifier } from './src/model-identifiers/LocalModelIdentifier';
export { DMModelIdentifier } from './src/model-identifiers/DMModelIdentifier';
export { LocalModelMetadataProvider } from './src/metadata-providers/LocalModelMetadataProvider';
export type { ModelIdentifier } from './src/ModelIdentifier';
export { createModelIdentifier } from './src/ModelIdentifier';
export type { ModelMetadataProvider } from './src/ModelMetadataProvider';
export type { ModelDataProvider } from './src/ModelDataProvider';
export type { GeometryFilter } from './src/GeometryFilter';

export type { PointCloudObjectMetadata, PointCloudObject } from './src/pointcloud-stylable-object-providers/types';
export type { PointCloudStylableObjectProvider } from './src/PointCloudStylableObjectProvider';
export type {
  StylableObject,
  SerializableStylableObject
} from './src/pointcloud-stylable-object-providers/StylableObject';

export { CdfPointCloudStylableObjectProvider } from './src/pointcloud-stylable-object-providers/CdfPointCloudStylableObjectProvider';
export { DummyPointCloudStylableObjectProvider } from './src/pointcloud-stylable-object-providers/DummyPointCloudStylableObjectProvider';

export { CdfPointCloudDMStylableObjectProvider } from './src/pointcloud-stylable-object-providers/pointcloud-volume-data-providers/CdfPointCloudDMStylableObjectProvider';
export { DummyPointCloudDMStylableObjectProvider } from './src/pointcloud-stylable-object-providers/pointcloud-volume-data-providers/DummyPointCloudDMStylableObjectProvider';

export type {
  BinaryFileProvider,
  JsonFileProvider,
  SignedFileProvider,
  BlobOutputMetadata,
  Image360Descriptor,
  Image360DescriptorProvider,
  Image360FileProvider,
  Image360Face,
  Image360Texture,
  Image360FileDescriptor,
  ImageAssetLinkAnnotationInfo,
  ImageInstanceLinkAnnotationInfo,
  InstanceReference,
  Image360Id,
  Image360RevisionId,
  Historical360ImageSet,
  FaceName,
  SignedFileItem
} from './src/types';
export { File3dFormat } from './src/types';

export { fetchDMModelIdFromRevisionId } from './src/requests/fetchDMModelIdFromRevisionId';
export {
  isDMPointCloudVolumeObject,
  isClassicPointCloudVolumeObject,
  isDMPointCloudVolume,
  isClassicPointCloudVolume
} from './src/utilities/utils';

export { getExternalIdFromDescriptor } from './src/utilities/getExternalIdFromDescriptor';

export { getInstanceKey } from './src/utilities/instanceIds';

export type {
  DataSourceType,
  ClassicDataSourceType,
  DMDataSourceType,
  ClassicModelIdentifierType,
  DMModelIdentifierType,
  InternalDataSourceType,
  LocalDataSourceType,
  LocalModelIdentifierType,
  GenericDataSourceType
} from './src/DataSourceType';
export { isClassicIdentifier, isDMIdentifier, isLocalIdentifier, isSameDMIdentifier } from './src/DataSourceType';

export type {
  LocalAddModelOptions,
  CommonModelOptions,
  InternalAddModelOptions,
  AddModelOptionsWithModelRevisionId
} from './src/utilities/internalAddModelOptions';

export type { MetadataWithSignedFiles } from './src/metadata-providers/types';

export { SignedUrlRefresher, type FetchWithRefreshOptions } from './src/utilities/SignedUrlRefresh';

export {
  PointCloudObjectCollection,
  PointCloudAnnotationVolumeCollection
} from './src/point-cloud-collections/PointCloudObjectCollection';
export { PointCloudDMVolumeCollection } from './src/point-cloud-collections/PointCloudDMVolumeCollection';
