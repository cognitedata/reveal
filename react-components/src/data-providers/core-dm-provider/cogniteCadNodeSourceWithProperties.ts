import { type SourceSelectorV3 } from '@cognite/sdk';
import { COGNITE_CAD_NODE_SOURCE } from './dataModels';
import { cogniteDescribableSourceWithProperties } from './cogniteDescribableSourceWithProperties';

export const cogniteCadNodeSourceWithProperties = [
  {
    source: COGNITE_CAD_NODE_SOURCE,
    properties: [
      ...cogniteDescribableSourceWithProperties[0].properties,
      'object3D',
      'model3D',
      'cadNodeReference',
      'revisions',
      'treeIndexes',
      'subTreeSizes'
    ]
  }
] as const satisfies SourceSelectorV3;
