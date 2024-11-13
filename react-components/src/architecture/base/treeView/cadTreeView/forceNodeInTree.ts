/*!
 * Copyright 2024 Cognite AS
 */

import type { CogniteClient, Node3D } from '@cognite/sdk';
import { type CadTreeNode } from './CadTreeNode';
import { type OnLoadedAction, type RevisionId } from './types';

// #region forceNodeInTree

export type ForceNodeInTreeArgs = {
  sdk: CogniteClient;
  revisionId: RevisionId;
  nodeId: number;
  onLoaded?: OnLoadedAction;
};

export async function forceNodeInTree(
  root: CadTreeNode,
  args: ForceNodeInTreeArgs
): Promise<boolean> {
  const cadTreeNode = root.getThisOrDescendantByNodeId(args.nodeId);
  if (cadTreeNode !== undefined) {
    return true;
  }
  await fetchAncestors(args).then((loadedNodes) => {
    return root.insertAncestors(loadedNodes, args.onLoaded);
  });
  return true;
}

async function fetchAncestors(args: ForceNodeInTreeArgs): Promise<Node3D[]> {
  const data = await args.sdk.revisions3D.list3DNodeAncestors(
    args.revisionId.modelId,
    args.revisionId.revisionId,
    args.nodeId
  );
  return data.items;
}

// #endregion
