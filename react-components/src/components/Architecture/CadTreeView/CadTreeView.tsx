/*!
 * Copyright 2024 Cognite AS
 */

import { useQuery } from '@tanstack/react-query';
import { type ReactElement } from 'react';

import { TreeView } from '@cognite/reveal-react-components';
import { useSDK } from '@cognite/sdk-provider';

import {
  fetchTreeNodeRoot,
  fetchTreeNodeArray,
  type RevisionId
} from '../../../architecture/base/treeView/cadTreeView/cadTreeNodeUtils';
import { type ITreeNode } from '../../../architecture';
import { Infobox, Loader } from '@cognite/cogs.js';
import { CadTreeNode } from '../../../architecture/base/treeView/cadTreeView/CadTreeNode';
import { type OnLoadedAction, type CadTreeViewProps } from './CadTreeViewProps';

export function CadTreeView(props: CadTreeViewProps): ReactElement | null {
  const sdk = useSDK();
  const id: RevisionId = { modelId: props.modelId, revisionId: props.revisionId };

  const {
    data: root,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['rootNode'],
    queryFn: async () => {
      const root = await fetchTreeNodeRoot(sdk, id);
      if (props.onLoaded !== undefined) {
        props.onLoaded(root, undefined);
      }
      return root;
    }
  });
  if (isLoading) {
    return <Loader />;
  }
  if (isError || root === undefined) {
    <Infobox status="error" title="Error loading">
      Can not load the tree
    </Infobox>;
    return null;
  }
  const key = `${props.modelId}-${props.revisionId}`;

  const loadNodes = async (
    node: ITreeNode,
    loadChildren: boolean
  ): Promise<ITreeNode[] | undefined> => {
    if (!(node instanceof CadTreeNode)) {
      return undefined;
    }
    const args = { sdk, id, node, loadChildren };
    return await fetchTreeNodeArray(args).then((loadedNodes) => {
      onLoadedNodes(node, loadChildren, loadedNodes, props.onLoaded);
      return loadedNodes;
    });
  };
  return <TreeView key={key} root={root} loadNodes={loadNodes} hasCheckboxes {...props} />;
}

function onLoadedNodes(
  node: CadTreeNode,
  loadChildren: boolean,
  loadedNodes: CadTreeNode[],
  onLoaded?: OnLoadedAction
): void {
  if (onLoaded === undefined) {
    return;
  }
  const parent = getParent(node, loadChildren);
  if (parent === undefined) {
    return;
  }
  for (const loadedNode of loadedNodes) {
    onLoaded(loadedNode, parent);
  }
}

function getParent(node: CadTreeNode, loadChildren: boolean): CadTreeNode | undefined {
  if (loadChildren) {
    return node;
  }
  // load siblings, get the parent of the sibling
  if (node.parent instanceof CadTreeNode) {
    return node.parent;
  }
  return undefined;
}
