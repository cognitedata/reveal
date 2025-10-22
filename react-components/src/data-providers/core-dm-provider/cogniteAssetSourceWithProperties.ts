import { COGNITE_ASSET_SOURCE } from './dataModels';
import { cogniteDescribableSourceWithProperties } from './cogniteDescribableSourceWithProperties';

const describableProperties: (typeof cogniteDescribableSourceWithProperties)[0]['properties'] =
  cogniteDescribableSourceWithProperties[0].properties;

const propsB = [
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
] as const;

export const cogniteAssetSourceWithProperties: [
  {
    source: typeof COGNITE_ASSET_SOURCE;
    properties: [...typeof describableProperties, ...typeof propsB];
  }
] = [
  {
    source: COGNITE_ASSET_SOURCE,
    properties: [...describableProperties, ...propsB]
  }
];
