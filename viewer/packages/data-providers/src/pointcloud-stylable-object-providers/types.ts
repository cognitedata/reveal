/*!
 * Copyright 2022 Cognite AS
 */

import { StylableObject } from './StylableObject';
import { DMInstanceRef, IShape } from '@reveal/utilities';

import { Box3 } from 'three';
import { AnnotationsAssetRef } from '@cognite/sdk';
import { ClassicDataSourceType, DataSourceType } from '../DataSourceType';

type VolumeAnnotation = {
  annotationId: number;
  asset?: AnnotationsAssetRef;
};
type VolumeDMReference = {
  instanceRef: DMInstanceRef;
  asset?: DMInstanceRef;
};

export type VolumeMetadata = VolumeAnnotation | VolumeDMReference;

export type CdfPointCloudObjectAnnotation = {
  volumeMetadata: VolumeMetadata;
  region: IShape[];
};

export function isVolumeAnnotation(volumeMetadata: VolumeMetadata): volumeMetadata is VolumeAnnotation {
  return (volumeMetadata as VolumeAnnotation).annotationId !== undefined;
}

export function isVolumeDMReference(volumeMetadata: VolumeMetadata): volumeMetadata is VolumeDMReference {
  return (volumeMetadata as VolumeDMReference).instanceRef !== undefined;
}

/**
 * @public
 * Metadata for a single point cloud object
 */
export type PointCloudObjectMetadata<T extends DataSourceType = ClassicDataSourceType> = {
  boundingBox: Box3;
} & T['pointCloudVolumeMetadata'];

/**
 * Point cloud object containing point cloud volume or annotation metadata and stylable object
 */
export type PointCloudObject<T extends DataSourceType = ClassicDataSourceType> = PointCloudObjectMetadata<T> & {
  stylableObject: StylableObject;
};
