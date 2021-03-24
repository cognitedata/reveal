import { Node3D } from '@cognite/sdk';
import { fixtureRootNodeId, modifiedRootSubtreeSize } from './fixtureConsts';

export const rootNodeObjRes: { items: [Node3D] } = {
  items: [
    {
      id: fixtureRootNodeId,
      treeIndex: 0,
      parentId: (undefined as never) as number,
      depth: 0,
      name: 'RootNode',
      subtreeSize: modifiedRootSubtreeSize,
      boundingBox: {
        max: [2500.0, 2500.0, 200.00003051757812],
        min: [-200.0, -200.00033569335938, -2500.0],
      },
    },
  ],
};
