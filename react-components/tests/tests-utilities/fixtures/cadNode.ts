import { Node3D } from '@cognite/sdk';

export function createCadNodeMock(params?: { id?: number; treeIndex?: number }): Node3D {
  return {
    id: params?.id ?? 1234,
    treeIndex: params?.treeIndex ?? 17,
    boundingBox: { max: [0, 1, 2], min: [-1, -2, -3] },
    subtreeSize: 42,
    parentId: 1,
    depth: 4,
    name: 'a node',
    properties: undefined
  } satisfies Node3D;
}
