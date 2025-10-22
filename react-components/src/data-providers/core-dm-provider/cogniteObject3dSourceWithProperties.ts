import { type SourceSelectorV3 } from '@cognite/sdk';
import { COGNITE_3D_OBJECT_SOURCE } from './dataModels';
import { cogniteDescribableSourceWithProperties } from './cogniteDescribableSourceWithProperties';

export const cogniteObject3dSourceWithProperties: [
  {
    readonly source: {
      readonly externalId: 'Cognite3DObject';
      readonly space: 'cdf_cdm';
      readonly version: 'v1';
      readonly type: 'view';
    };
    readonly properties: [
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
    ];
  }
] = [
  {
    source: COGNITE_3D_OBJECT_SOURCE,
    properties: [
      ...cogniteDescribableSourceWithProperties[0].properties,
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
