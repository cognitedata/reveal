/*!
 * Copyright 2024 Cognite AS
 */
import { type SourceSelectorV3 } from '@cognite/sdk';
import { COGNITE_CAD_NODE_SOURCE } from './dataModels';

export const cogniteCadNodeSourceWithProperties = [
  {
    source: COGNITE_CAD_NODE_SOURCE,
    properties: [
      'name',
      'description',
      'tags',
      'aliases',
      'object3D',
      'model3D',
      'cadNodeReference',
      'revisions',
      'treeIndexes',
      'subTreeSizes'
    ]
  }
] as const satisfies SourceSelectorV3;
