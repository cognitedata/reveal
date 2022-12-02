/*!
 * Copyright 2021 Cognite AS
 */

import { CogniteCadModel } from '@reveal/cad-model';
import { CognitePointCloudModel } from '@reveal/pointclouds';

/**
 * Type abstraction for CogniteCadModel or CognitePointCloudModel;.
 */
export type CogniteModel = CogniteCadModel | CognitePointCloudModel;

export { WellKnownAsprsPointClassCodes } from '@reveal/pointclouds';

export { PointShape, PointColorType, PointSizeType } from '@reveal/rendering';

export * from './migration/types';
