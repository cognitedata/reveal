import React from 'react';
import {
  CustomDataNode,
  TreeDataNode,
  TreeLoadMoreNode,
} from 'src/pages/RevisionDetails/components/TreeView/types';
import { LoadMore } from 'src/pages/RevisionDetails/components/TreeView/LoadMore';
import { v3, v3Client } from '@cognite/cdf-sdk-singleton';
import { node3dToCustomDataNode } from 'src/pages/RevisionDetails/components/TreeView/utils/node3dToCustomDataNode';
import promiseRetry from 'promise-retry';

export const FETCH_PARAMS: v3.List3DNodesQuery = {
  depth: 1,
  limit: 50,
} as const;

export type RevisionId = {
  modelId: number;
  revisionId: number;
};
export type FetchNodesArgs = RevisionId & {
  cursor?: string;
  parent: TreeLoadMoreNode['parent'];
  params?: Pick<v3.List3DNodesQuery, 'depth' | 'limit'>;
};

export async function fetchRootTreeNodes({
  modelId,
  revisionId,
}: RevisionId): Promise<TreeDataNode[]> {
  // at the time of writing the initial fetch is very slow because it causes index to be created
  // so for big models it sometimes fails with timeout
  const data = await promiseRetry(
    (retry) => {
      return v3Client.revisions3D
        .list3DNodes(modelId, revisionId, {
          ...FETCH_PARAMS,
        })
        .catch(retry);
    },
    { retries: 3 }
  );
  const treeData = node3dToCustomDataNode(
    data.items.slice(0, 1) // root node
  ) as TreeDataNode[];

  treeData[0].children = node3dToCustomDataNode(data.items.slice(1));

  if (data.nextCursor) {
    const loadMoreOption: TreeLoadMoreNode = createLoadMoreOption({
      cursor: data.nextCursor,
      parent: {
        nodeId: data.items[0].id,
        treeIndex: data.items[0].treeIndex,
      },
    });
    treeData[0].children!.push(loadMoreOption);
  }

  return treeData;
}

export async function fetchTreeNodes({
  modelId,
  revisionId,
  cursor,
  parent,
  params,
}: FetchNodesArgs): Promise<CustomDataNode[]> {
  const data = await v3Client.revisions3D.list3DNodes(modelId, revisionId, {
    ...FETCH_PARAMS,
    ...params,
    cursor,
    nodeId: parent.nodeId,
  });

  // first item is always the node that passed in request options as nodeId
  // unless cursor is passed
  const useAll = cursor || params?.limit === 1;
  const subtreeItems: CustomDataNode[] = node3dToCustomDataNode(
    useAll ? data.items : data.items.slice(1)
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
