/*!
 * Copyright 2022 Cognite AS
 */

import { StylableObject } from './StylableObject';
import { IShape } from '@reveal/utilities';

import { Box3 } from 'three';
import { AnnotationsAssetRef, DirectRelationReference } from '@cognite/sdk';
import { ClassicDataSourceType, DataSourceType, DMDataSourceType } from '../DataSourceType';

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
 * Data model instance reference for point cloud volume object with asset reference.
 */
export type DMPointCloudDataType = DMDataSourceType & {
  /**
   * The typename of the point cloud data
   */
  type: 'dm';
  _never: never;
};

/**
 * @public
 * Classic point cloud annotation data type with asset reference.
 */
export type ClassicPointCloudDataType = ClassicDataSourceType & {
  /**
   * The typename of the point cloud data
   */
  type: 'classic';
  _never: never;
};

/**
 * @public
 * Metadata for a single point cloud object
 */
export type PointCloudObjectMetadata<T extends DataSourceType = ClassicPointCloudDataType> = {
  boundingBox: Box3;
} & T['pointCloudVolumeMetadata'];

/**
 * Point cloud object containing point cloud volume or annotation metadata and stylable object
 */
export type PointCloudObject<T extends DataSourceType = ClassicPointCloudDataType> = PointCloudObjectMetadata<T> & {
  stylableObject: StylableObject;
};

export type DMPointCloudVolumeIdentifier = {
  space: string;
  pointCloudModelExternalId: string;
  pointCloudModelRevisionId: string;
};
