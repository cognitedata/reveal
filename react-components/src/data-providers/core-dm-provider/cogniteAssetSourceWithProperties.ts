import { type SourceSelectorV3 } from '@cognite/sdk';
import { COGNITE_ASSET_SOURCE } from './dataModels';
import { cogniteDescribableSourceWithProperties } from './cogniteDescribableSourceWithProperties';

export const cogniteAssetSourceWithProperties = [
  {
    source: COGNITE_ASSET_SOURCE,
    properties: [
      ...cogniteDescribableSourceWithProperties[0].properties,
      'object3D',
      'sourceId',
      'sourceContext',
      'source',
      'sourceCreatedTime',
      'sourceUpdatedTime',
      'sourceCreatedUser',
      'sourceUpdatedUser',
      'parent',
      'root',
      'path',
      'pathLastUpdatedTime',
      'equipment',
      'assetClass',
      'type',
      'files',
      'children',
      'activities',
      'timeSeries'
    ]
  }
] as const satisfies SourceSelectorV3;
