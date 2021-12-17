import React from 'react';
import {
  CustomDataNode,
  TreeDataNode,
  TreeLoadMoreNode,
} from 'src/pages/RevisionDetails/components/TreeView/types';
import { LoadMore } from 'src/pages/RevisionDetails/components/TreeView/LoadMore';
import sdk from '@cognite/cdf-sdk-singleton';
import { List3DNodesQuery, Node3D } from '@cognite/sdk';
import { node3dToTreeDataNode } from 'src/pages/RevisionDetails/components/TreeView/utils/converters';
import { getProject } from '@cognite/cdf-utilities';
import { sortNaturally } from 'src/utils';

export const FETCH_PARAMS: List3DNodesQuery = {
  depth: 1,
  limit: 50,
} as const;

export type RevisionId = {
  modelId: number;
  revisionId: number;
};
export type FetchNodesArgs = {
  cursor?: string;
  parent: TreeLoadMoreNode['parent'];
  params?: Pick<List3DNodesQuery, 'depth' | 'limit'>;
};

async function fetchRootNode(modelId, revisionId): Promise<Node3D> {
  // having this function separated from first request is not a performance optimisation
  // we just need to know rootId to fetch its children
  // because it's not guaranteed that API will give you rootNode in the first response
  // (it might be in another response chunk which you access by using a cursor)
  // alternative is to use huge limit for the first request to cover any potential cases
  // when model has LOTS of nodes with depth=1 i.e. direct children of root node

  // /nodes endpoint doesn't have treeIndex filter, so here we go...
  const outputsUrl = `${sdk.getBaseUrl()}/api/v1/projects/${getProject()}/3d/models/${modelId}/revisions/${revisionId}/nodes/internalids/bytreeindices`;
  const rootNodeIdResponse = await sdk.post<{ items: number[] }>(outputsUrl, {
    data: { items: [0] },
  });
  if (rootNodeIdResponse.status !== 200) {
    throw new Error(
      rootNodeIdResponse.data
        ? JSON.stringify(rootNodeIdResponse.data)
        : `${rootNodeIdResponse.status} - failed to fetch the root node.`
    );
  }
  const rootNodeId = rootNodeIdResponse.data.items[0];

  const rootNodeObjResponse = await sdk.revisions3D.retrieve3DNodes(
    modelId,
    revisionId,
    [{ id: rootNodeId }]
  );

  return rootNodeObjResponse[0];
}

export async function fetchRootTreeNodes({
  modelId,
  revisionId,
}: RevisionId): Promise<TreeDataNode[]> {
  const rootNode = await fetchRootNode(modelId, revisionId);
  const treeData = node3dToTreeDataNode([rootNode]);

  treeData[0].children = await fetchTreeNodes({
    modelId,
    revisionId,
    parent: { nodeId: rootNode.id, treeIndex: 0 },
  });

  return treeData;
}

export async function fetchTreeNodes({
  modelId,
  revisionId,
  cursor,
  parent,
  params,
}: RevisionId & FetchNodesArgs): Promise<CustomDataNode[]> {
  const data = await sdk.revisions3D.list3DNodes(modelId, revisionId, {
    ...FETCH_PARAMS,
    ...params,
    cursor,
    nodeId: parent.nodeId,
  });

  let subtreeItems: TreeDataNode[] = node3dToTreeDataNode(
    params?.limit === 1
      ? data.items
      : data.items.filter((node) => node.id !== parent.nodeId) // nodeId passed in request appears in random order
  );

  subtreeItems = subtreeItems.sort((a, b) => {
    return sortNaturally(a.meta.name, b.meta.name);
  });

  if (data.nextCursor) {
    const loadMoreOption = createLoadMoreOption({
      parent,
      cursor: data.nextCursor,
    });
    return [...subtreeItems, loadMoreOption];
  }

  return subtreeItems;
}

export async function fetchAncestors({
  modelId,
  revisionId,
  nodeId,
}: RevisionId & { nodeId: number }): Promise<Node3D[]> {
  const data = await sdk.revisions3D.list3DNodeAncestors(
    modelId,
    revisionId,
    nodeId
  );
  return data.items;
}

function createLoadMoreOption({
  parent,
  cursor,
}: {
  parent: TreeLoadMoreNode['parent'];
  cursor: TreeLoadMoreNode['key'];
}): TreeLoadMoreNode {
  return {
    key: `${parent.nodeId}_${cursor}`, // cursor uniqueness is not guaranteed by API
    cursor,
    title: <LoadMore />,
    parent,
    checkable: false,
    isLeaf: true,
  };
}
