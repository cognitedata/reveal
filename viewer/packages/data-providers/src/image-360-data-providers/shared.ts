/*!
 * Copyright 2025 Cognite AS
 */
import { Image360RevisionId, ImageAssetLinkAnnotationInfo, ImageInstanceLinkAnnotationInfo } from '../types';
import { DataSourceType } from '../DataSourceType';
import {
  AnnotationData,
  AnnotationModel,
  AnnotationsTypesImagesAssetLink,
  AnnotationsTypesImagesInstanceLink,
  Metadata
} from '@cognite/sdk';
import {
  Image360DataModelIdentifier,
  Image360LegacyDataModelIdentifier
} from './descriptor-providers/datamodels/system-space/Cdf360DataModelsDescriptorProvider';
import { isDmIdentifier } from '@reveal/utilities';

export function isClassicMetadata360Identifier(
  id: DataSourceType['image360Identifier']
): id is Metadata & { site_id: string } {
  return (id as Metadata).site_id !== undefined;
}

export function isClassic360Identifier(
  id: DataSourceType['image360Identifier']
): id is (Metadata & { site_id: string }) | Image360DataModelIdentifier {
  return isLegacyDM360Identifier(id) || isClassicMetadata360Identifier(id);
}

export function isLegacyDM360Identifier(
  id: DataSourceType['image360Identifier']
): id is Image360LegacyDataModelIdentifier {
  return (
    (id as Image360DataModelIdentifier).image360CollectionExternalId !== undefined &&
    (id as Image360DataModelIdentifier).space !== undefined &&
    ((id as Image360DataModelIdentifier).source === 'dm' || (id as Image360DataModelIdentifier).source === undefined)
  );
}

export function isCoreDmImage360Identifier(
  id: DataSourceType['image360Identifier']
): id is Image360DataModelIdentifier {
  return (
    (id as Image360DataModelIdentifier).image360CollectionExternalId !== undefined &&
    (id as Image360DataModelIdentifier).space !== undefined &&
    (id as Image360DataModelIdentifier).source === 'cdm'
  );
}
export function isFdm360ImageCollectionIdentifier(
  id: DataSourceType['image360Identifier']
): id is Image360DataModelIdentifier {
  return isLegacyDM360Identifier(id) || isCoreDmImage360Identifier(id);
}

export function isSameImage360RevisionId<T extends DataSourceType>(
  id0: Image360RevisionId<T>,
  id1: Image360RevisionId<T>
): boolean {
  if (isDmIdentifier(id0) && isDmIdentifier(id1)) {
    return id0.externalId === id1.externalId && id0.space === id1.space;
  } else if (typeof id0 === 'string' && typeof id1 === 'string') {
    return id0 === id1;
  }

  return false;
}

export function isImageAssetLinkAnnotation(annotation: AnnotationModel): annotation is ImageAssetLinkAnnotationInfo {
  return isAssetLinkAnnotationData(annotation.data);
}

function isAssetLinkAnnotationData(annotationData: AnnotationData): annotationData is AnnotationsTypesImagesAssetLink {
  const data = annotationData as AnnotationsTypesImagesAssetLink;
  return data.text !== undefined && data.textRegion !== undefined && data.assetRef !== undefined;
}

export function isImageInstanceLinkAnnotation(
  annotation: AnnotationModel
): annotation is ImageInstanceLinkAnnotationInfo {
  return isInstanceLinkAnnotationData(annotation.data);
}

function isInstanceLinkAnnotationData(
  annotationData: AnnotationData
): annotationData is AnnotationsTypesImagesInstanceLink {
  const data = annotationData as AnnotationsTypesImagesInstanceLink;
  return data.text !== undefined && data.textRegion !== undefined && data.instanceRef !== undefined;
}
