/*!
 * Copyright 2024 Cognite AS
 */

import type { CogniteClient, Node3D } from '@cognite/sdk';
import { type CadTreeNode } from './CadTreeNode';
import { type OnLoadedAction, type RevisionId } from './types';

export type ForceNodeInTreeArgs = {
  sdk: CogniteClient;
  revisionId: RevisionId;
  nodeId: number;
  onLoaded?: OnLoadedAction;
};

export async function forceNodeInTree(
  root: CadTreeNode,
  args: ForceNodeInTreeArgs
): Promise<CadTreeNode | undefined> {
  const cadTreeNode = root.getThisOrDescendantByNodeId(args.nodeId);
  if (cadTreeNode !== undefined) {
    cadTreeNode.expandAllAncestors();
    return cadTreeNode; // already in the tree
  }
  return await fetchAncestors(args).then((loadedNodes) => {
    const newCadTreeNode = root.insertAncestors(loadedNodes, args.onLoaded);
    if (newCadTreeNode === undefined) {
      return undefined; // This should not happen
    }
    // A new now is created
    newCadTreeNode.expandAllAncestors();
    return newCadTreeNode;
  });
}

async function fetchAncestors(args: ForceNodeInTreeArgs): Promise<Node3D[]> {
  const data = await args.sdk.revisions3D.list3DNodeAncestors(
    args.revisionId.modelId,
    args.revisionId.revisionId,
    args.nodeId
  );
  return data.items;
}
