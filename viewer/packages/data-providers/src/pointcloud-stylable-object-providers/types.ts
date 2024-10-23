/*!
 * Copyright 2022 Cognite AS
 */

import { StylableObject } from './StylableObject';
import { IShape } from '@reveal/utilities';

import { Box3 } from 'three';
import { AnnotationsAssetRef, DirectRelationReference } from '@cognite/sdk';
import { ClassicDataSourceType, DataSourceType } from '../DataSourceType';

/**
 * @public
 * CDF Data model instance reference
 */
export type DMInstanceRef = DirectRelationReference;

export type CdfPointCloudObjectAnnotation = {
  annotationId: number;
  volumeInstanceRef?: DMInstanceRef;
  asset?: AnnotationsAssetRef | DMInstanceRef;
  region: IShape[];
};

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

export type DMPointCloudVolumeIdentifier = {
  space: string;
  pointCloudModelExternalId: string;
  pointCloudModelRevisionId: string;
};
