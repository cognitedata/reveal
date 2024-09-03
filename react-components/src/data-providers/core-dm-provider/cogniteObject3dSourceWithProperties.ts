/*!
 * Copyright 2024 Cognite AS
 */
import { type SourceSelectorV3 } from '@cognite/sdk';
import { COGNITE_3D_OBJECT_SOURCE } from './dataModels';

export const cogniteObject3dSourceWithProperties = [
  {
    source: COGNITE_3D_OBJECT_SOURCE,
    properties: [
      'name',
      'description',
      'tags',
      'aliases',
      'xMin',
      'xMax',
      'yMin',
      'yMax',
      'zMin',
      'zMax',
      'asset',
      'cadNodes',
      'images360',
      'pointCloudVolumes'
    ]
  }
] as const satisfies SourceSelectorV3;
