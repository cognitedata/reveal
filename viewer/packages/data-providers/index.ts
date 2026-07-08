/*!
 * Copyright 2021 Cognite AS
 */
export { CdfModelDataProvider } from './src/model-data-providers/CdfModelDataProvider';
export { CachedModelDataProvider } from './src/model-data-providers/CachedModelDataProvider';
export { CdfModelIdentifier } from './src/model-identifiers/CdfModelIdentifier';
export { CdfModelMetadataProvider } from './src/metadata-providers/CdfModelMetadataProvider';
export { getAnnotationIdKey } from './src/image-360-data-providers/annotations';
export { Cdf360ImageAnnotationProvider } from './src/image-360-data-providers/Cdf360ImageAnnotationProvider';
export {
  type Cdf360ImageAnnotationCache,
  createCdf360ImageAnnotationCache
} from './src/image-360-data-providers/Cdf360ImageAnnotationCache';
export { Cdf360EventDescriptorProvider } from './src/image-360-data-providers/descriptor-providers/events/Cdf360EventDescriptorProvider';
export { CoreDm360ImageAnnotationProvider } from './src/image-360-data-providers/CoreDm360ImageAnnotationProvider';
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
  isClassicMetadata360Identifier
} from './src/image-360-data-providers/shared';
export type { CoreDmImage360Annotation } from './src/image-360-data-providers/cdm/types';
export { LocalModelDataProvider } from './src/model-data-providers/LocalModelDataProvider';
export { LocalModelIdentifier } from './src/model-identifiers/LocalModelIdentifier';
export { DMModelIdentifier } from './src/model-identifiers/DMModelIdentifier';
export { LocalModelMetadataProvider } from './src/metadata-providers/LocalModelMetadataProvider';
export { Local360ImageProvider } from './src/image-360-data-providers/Local360ImageProvider';
export type { ModelIdentifier } from './src/ModelIdentifier';
export { createModelIdentifier } from './src/ModelIdentifier';
export type { ModelMetadataProvider } from './src/ModelMetadataProvider';
export type { ModelDataProvider } from './src/ModelDataProvider';

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

export type { Image360Provider, Image360ProviderMap } from './src/Image360Provider';
export { getImage360ProviderFromMap } from './src/Image360Provider';
export { Image360ProviderCombiner } from './src/Image360ProviderCombiner';
export type {
  BinaryFileProvider,
  JsonFileProvider,
  SignedFileProvider,
  BlobOutputMetadata,
  Image360Descriptor,
  Image360FileProvider,
  Image360Face,
  Image360Texture,
  Image360FileDescriptor,
  ImageAssetLinkAnnotationInfo,
  ImageInstanceLinkAnnotationInfo,
  InstanceReference,
  Image360Id,
  Image360RevisionId,
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
export { isClassicIdentifier, isDMIdentifier, isLocalIdentifier } from './src/DataSourceType';

export type {
  LocalAddModelOptions,
  CommonModelOptions,
  InternalAddModelOptions,
  AddModelOptionsWithModelRevisionId
} from './src/utilities/internalAddModelOptions';

export type { MetadataWithSignedFiles } from './src/metadata-providers/types';
