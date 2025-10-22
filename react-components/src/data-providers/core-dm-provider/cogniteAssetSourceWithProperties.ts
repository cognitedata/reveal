import { type SourceSelectorV3 } from '@cognite/sdk';
import { COGNITE_ASSET_SOURCE } from './dataModels';
import { cogniteDescribableSourceWithProperties } from './cogniteDescribableSourceWithProperties';

export const cogniteAssetSourceWithProperties: [{
    readonly source: {
        readonly externalId: "CogniteAsset";
        readonly space: "cdf_cdm";
        readonly version: "v1";
        readonly type: "view";
    };
    readonly properties: ["name", "description", "tags", "aliases", "object3D", "sourceId", "sourceContext", "source", "sourceCreatedTime", "sourceUpdatedTime", "sourceCreatedUser", "sourceUpdatedUser", "parent", "root", "path", "pathLastUpdatedTime", "equipment", "assetClass", "type", "files", "children", "activities", "timeSeries"];
}] = [
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
