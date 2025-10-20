import type { List3DNodesQuery, Node3D } from '@cognite/sdk';

export type ICogniteClient = {
  list3DNodes: (
    modelId: number,
    revisionId: number,
    query: List3DNodesQuery
  ) => Promise<{ items: Node3D[]; nextCursor?: string }>;

  list3DNodeAncestors: (
    modelId: number,
    revisionId: number,
    nodeId: number
  ) => Promise<{ items: Node3D[] }>;
};
