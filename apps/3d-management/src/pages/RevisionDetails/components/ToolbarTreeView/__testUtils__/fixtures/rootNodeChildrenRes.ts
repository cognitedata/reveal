import { rootNodeObjRes } from './rootNodeObjRes';

export const rootNodeChildrenRes = {
  items: [
    rootNodeObjRes.items[0],
    {
      id: 6025029534731389,
      treeIndex: 1,
      parentId: 7587176698924415,
      depth: 1,
      name: 'Light',
      subtreeSize: 1,
      properties: {
        CogniteCategory: {
          InheritType: '1',
        },
      },
    },
    {
      id: 4118495943076177,
      treeIndex: 2,
      parentId: 7587176698924415,
      depth: 1,
      name: 'Camera',
      subtreeSize: 1,
      properties: {
        CogniteCategory: {
          InheritType: '1',
          AspectW: '1920',
          ResolutionMode: '0',
          BackgroundMode: '0',
          AspectH: '1080',
          ForegroundTransparent: 'True',
          ViewFrustum: 'True',
        },
      },
    },
    {
      id: 3518215128723287,
      treeIndex: 3,
      parentId: 7587176698924415,
      depth: 1,
      name: 'Cube',
      subtreeSize: 5,
      properties: {
        CogniteCategory: {
          InheritType: '1',
        },
      },
      boundingBox: {
        max: [2500.0, 2500.0, 200.00003051757812],
        min: [-200.0, -200.00033569335938, -2500.0],
      },
    },
  ],
  nextCursor: 'fakeCursor',
};
