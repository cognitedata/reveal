import { rootNodeChildrenRes } from './rootNodeChildrenRes';

export const fakeFirstLevelSiblingsRes = {
  items: [
    rootNodeChildrenRes.items[0],
    {
      id: 88888888,
      treeIndex: 8,
      parentId: rootNodeChildrenRes.items[0].id,
      depth: 1,
      name: 'Fake child',
      subtreeSize: 1,
      boundingBox: {
        max: [2500.0, 2500.0, 200.00003051757812],
        min: [-200.0, -200.00033569335938, -2500.0],
      },
    },
  ],
};
