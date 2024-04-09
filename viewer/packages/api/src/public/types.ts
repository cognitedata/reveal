/*!
 * Copyright 2021 Cognite AS
 */

import { Image360, Image360Collection, Image360Revision } from '@reveal/360-images';
import { CogniteCadModel } from '@reveal/cad-model';
import { CognitePointCloudModel } from '@reveal/pointclouds';

/**
 * Type abstraction for CogniteCadModel or CognitePointCloudModel;.
 */
export type CogniteModel = CogniteCadModel | CognitePointCloudModel;

export { WellKnownAsprsPointClassCodes } from '@reveal/pointclouds';

export { PointShape, PointColorType, PointSizeType } from '@reveal/rendering';

export type Image360WithCollectionAndRevision = {
  image360Collection: Image360Collection;
  image360: Image360;
  image360Revision: Image360Revision;
};

export * from './migration/types';
