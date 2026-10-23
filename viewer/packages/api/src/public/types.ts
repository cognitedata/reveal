/*!
 * Copyright 2021 Cognite AS
 */

import type { Image360, Image360Collection } from '@reveal/360-images';
import type { CogniteCadModel } from '@reveal/cad-model';
import type { ClassicDataSourceType, DataSourceType } from '@reveal/data-providers/src/DataSourceType';
import type { CognitePointCloudModel } from '@reveal/pointclouds';
import type { Vector3, Quaternion, Matrix4 } from 'three';

/**
 * Type abstraction for CogniteCadModel or CognitePointCloudModel;.
 */
export type CogniteModel<T extends DataSourceType = ClassicDataSourceType> =
  CogniteCadModel | CognitePointCloudModel<T>;

export { WellKnownAsprsPointClassCodes } from '@reveal/pointclouds';

export { PointShape, PointColorType, PointSizeType, CadShadowReceiverForCustomObjectMaterial } from '@reveal/rendering';

/**
 * A tuple of a 360 image and its collection.
 */
export type Image360WithCollection<T extends DataSourceType = ClassicDataSourceType> = {
  image360Collection: Image360Collection<T>;
  image360: Image360<T>;
};

/** What a pick depends on: where the camera is, which way it looks, and how it projects. */
export type CameraSnapshot = { position: Vector3; rotation: Quaternion; projection: Matrix4 };

export type * from './migration/types';
