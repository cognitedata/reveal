/*!
 * Copyright 2021 Cognite AS
 */

import { Image360, Image360Collection } from '@reveal/360-images';
import { CogniteCadModel } from '@reveal/cad-model';
import { CognitePointCloudModel } from '@reveal/pointclouds';

/**
 * Type abstraction for CogniteCadModel or CognitePointCloudModel;.
 */
export type CogniteModel = CogniteCadModel | CognitePointCloudModel;

export { WellKnownAsprsPointClassCodes } from '@reveal/pointclouds';

export { PointShape, PointColorType, PointSizeType } from '@reveal/rendering';

/**
 * A tuple of a 360 image and its collection.
 */
export type Image360WithCollection = {
  image360Collection: Image360Collection;
  image360: Image360;
};

export * from './migration/types';
