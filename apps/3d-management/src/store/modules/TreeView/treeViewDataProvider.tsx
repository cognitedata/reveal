import React from 'react';
import {
  CustomDataNode,
  TreeDataNode,
  TreeLoadMoreNode,
} from 'src/pages/RevisionDetails/components/TreeView/types';
import { LoadMore } from 'src/pages/RevisionDetails/components/TreeView/LoadMore';
import { v3, v3Client } from '@cognite/cdf-sdk-singleton';
import { node3dToTreeDataNode } from 'src/pages/RevisionDetails/components/TreeView/utils/converters';
import { getProject } from '@cognite/cdf-utilities';
import promiseRetry from 'promise-retry';

export const FETCH_PARAMS: v3.List3DNodesQuery = {
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
  params?: Pick<v3.List3DNodesQuery, 'depth' | 'limit'>;
};

async function fetchRootNode(modelId, revisionId): Promise<v3.Node3D> {
  // having this function separated from first request is not a performance optimisation
  // we just need to know rootId to fetch its children
  // because it's not guaranteed that API will give you rootNode in the first response
  // (it might be in another response chunk which you access by using a cursor)
  // alternative is to use huge limit for the first request to cover any potential cases
  // when model has LOTS of nodes with depth=1 i.e. direct children of root node

  // /nodes endpoint doesn't have treeIndex filter, so here we go...
  const outputsUrl = `${v3Client.getBaseUrl()}/api/v1/projects/${getProject()}/3d/models/${modelId}/revisions/${revisionId}/nodes/internalids/bytreeindices`;
  const rootNodeIdResponse = await v3Client.post<{ items: number[] }>(
    outputsUrl,
    {
      data: { items: [0] },
    }
  );
  if (rootNodeIdResponse.status !== 200) {
    throw new Error(
      rootNodeIdResponse.data
        ? JSON.stringify(rootNodeIdResponse.data)
        : `${rootNodeIdResponse.status} - failed to fetch the root node.`
    );
  }
  const rootNodeId = rootNodeIdResponse.data.items[0];

  const rootNodeObjResponse = await v3Client.revisions3D.retrieve3DNodes(
    modelId,
    revisionId,
    [{ id: rootNodeId }]
  );

  return rootNodeObjResponse[0];
}

// the first request is really slow for big models, we need an index for depth param to make it work smooth
export async function fetchRootTreeNodes({
  modelId,
  revisionId,
}: RevisionId): Promise<TreeDataNode[]> {
  const rootNode = await fetchRootNode(modelId, revisionId);
  const treeData = node3dToTreeDataNode([rootNode]);

  // at the time of writing the initial fetch is very slow because it causes index to be created
  // so for big models it sometimes fails with timeout
  treeData[0].children = await promiseRetry(
    (retry) => {
      return fetchTreeNodes({
        modelId,
        revisionId,
        parent: { nodeId: rootNode.id, treeIndex: 0 },
      }).catch(retry);
    },
    { retries: 3 }
  );

  return treeData;
}

export async function fetchTreeNodes({
  modelId,
  revisionId,
  cursor,
  parent,
  params,
}: RevisionId & FetchNodesArgs): Promise<CustomDataNode[]> {
  const data = await v3Client.revisions3D.list3DNodes(modelId, revisionId, {
    ...FETCH_PARAMS,
    ...params,
    cursor,
    nodeId: parent.nodeId,
  });

  const subtreeItems: CustomDataNode[] = node3dToTreeDataNode(
    params?.limit === 1
      ? data.items
      : data.items.filter((node) => node.id !== parent.nodeId) // nodeId passed in request appears in random order
  );

  if (data.nextCursor) {
    const loadMoreOption = createLoadMoreOption({
      parent,
      cursor: data.nextCursor,
    });
    subtreeItems.push(loadMoreOption);
  }

  return subtreeItems;
}

export async function fetchAncestors({
  modelId,
  revisionId,
  nodeId,
}: RevisionId & { nodeId: number }): Promise<v3.Node3D[]> {
  const data = await v3Client.revisions3D.list3DNodeAncestors(
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
