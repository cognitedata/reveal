import { type SourceSelectorV3 } from '@cognite/sdk';
import { COGNITE_CAD_NODE_SOURCE } from './dataModels';
import { cogniteDescribableSourceWithProperties } from './cogniteDescribableSourceWithProperties';

export const cogniteCadNodeSourceWithProperties: [{
    readonly source: {
        readonly externalId: "CogniteCADNode";
        readonly space: "cdf_cdm";
        readonly version: "v1";
        readonly type: "view";
    };
    readonly properties: ["name", "description", "tags", "aliases", "object3D", "model3D", "cadNodeReference", "revisions", "treeIndexes", "subTreeSizes"];
}] = [
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
