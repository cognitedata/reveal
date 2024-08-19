import { SourceSelectorV3 } from '@cognite/sdk/dist/src';
import { COGNITE_ASSET_SOURCE } from './dataModels';

export const cogniteAssetSourceWithProperties = [
  {
    source: COGNITE_ASSET_SOURCE,
    properties: [
      'object3D',
      'name',
      'description',
      'tags',
      'aliases',
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
      'lastPathMaterializationTime',
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
