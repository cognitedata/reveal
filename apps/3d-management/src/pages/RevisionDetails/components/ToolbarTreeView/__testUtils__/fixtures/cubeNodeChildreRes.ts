import {
  fixtureCubeNodeFirstChildId,
  fixtureCubeNodeId,
} from './fixtureConsts';
import { rootNodeChildrenRes } from './rootNodeChildrenRes';

export const cubeNodeChildrenRes = {
  items: [
    rootNodeChildrenRes.items.find(({ id }) => id === fixtureCubeNodeId)!,
    {
      id: fixtureCubeNodeFirstChildId,
      treeIndex: 4,
      parentId: 3518215128723287,
      depth: 2,
      name: 'Cube (1)',
      subtreeSize: 1,
      boundingBox: {
        max: [200.0, 199.99966430664062, -99.99998474121094],
        min: [-200.0, -200.00033569335938, -2500.0],
      },
    },
    {
      id: 5528114778128032,
      treeIndex: 5,
      parentId: 3518215128723287,
      depth: 2,
      name: 'Cube (2)',
      subtreeSize: 1,
      boundingBox: {
        max: [2500.0, 200.00003051757812, 200.00003051757812],
        min: [100.0, -200.00003051757812, -200.00003051757812],
      },
    },
    {
      id: 4086799595416334,
      treeIndex: 6,
      parentId: 3518215128723287,
      depth: 2,
      name: 'Cube (3)',
      subtreeSize: 1,
      boundingBox: {
        max: [200.0, 2500.0, 199.99966430664062],
        min: [-200.0, 99.99998474121094, -200.00033569335938],
      },
    },
    {
      id: 6444092424355782,
      treeIndex: 7,
      parentId: 3518215128723287,
      depth: 2,
      name: 'Cube (4)',
      subtreeSize: 1,
      boundingBox: {
        max: [100.0, 100.00001525878906, 100.00001525878906],
        min: [-100.0, -100.00001525878906, -100.00001525878906],
      },
    },
  ],
};
