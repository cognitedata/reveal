/*!
 * Copyright 2024 Cognite AS
 */

import type { CogniteClient, Node3D } from '@cognite/sdk';
import { TreeNode } from '../TreeNode';
import { fetchAncestors, type RevisionId } from './cadTreeNodeUtils';

export type OnLoadedAction = (node: CadTreeNode, parent?: CadTreeNode) => void;

export class CadTreeNode extends TreeNode {
  private readonly _id: number;
  private readonly _treeIndex: number;
  private _loadSiblingCursor?: string;

  constructor(node: Node3D) {
    super();
    this._id = node.id;
    this._treeIndex = node.treeIndex;
    this.label = node.name === '' ? node.id.toString() : node.name;
  }

  public get id(): number {
    return this._id;
  }

  public get treeIndex(): number {
    return this._treeIndex;
  }

  public get loadSiblingCursor(): string | undefined {
    return this._loadSiblingCursor;
  }

  public set loadSiblingCursor(value: string | undefined) {
    this._loadSiblingCursor = value;
    this.needLoadSiblings = value !== undefined;
  }

  public getThisOrDescendantByTreeIndex(treeIndex: number): CadTreeNode | undefined {
    for (const descendant of this.getThisAndDescendantsByType(CadTreeNode)) {
      if (descendant.treeIndex === treeIndex) {
        return descendant;
      }
    }
  }

  public *getThisOrDescendantsByTreeIndices(treeIndices: number[]): Generator<CadTreeNode> {
    for (const descendant of this.getThisAndDescendantsByType(CadTreeNode)) {
      const index = treeIndices.indexOf(descendant.treeIndex);
      if (index >= 0) {
        yield descendant;
      }
    }
  }

  public getThisOrDescendantByNodeId(nodeId: number): CadTreeNode | undefined {
    for (const descendant of this.getThisAndDescendantsByType(CadTreeNode)) {
      if (descendant.id === nodeId) {
        return descendant;
      }
    }
  }

  public getChildByNodeId(nodeId: number): CadTreeNode | undefined {
    for (const descendant of this.getChildren()) {
      if (!(descendant instanceof CadTreeNode)) {
        continue;
      }
      if (descendant.id !== nodeId) {
        continue;
      }
      return descendant;
    }
  }

  public async forceShowNode(args: ForceShowArgs): Promise<boolean> {
    const cadTreeNode = this.getThisOrDescendantByNodeId(args.nodeId);
    if (cadTreeNode !== undefined) {
      return true;
    }
    await fetchAncestors(args).then((loadedNodes) => {
      return this.insertAncestors(loadedNodes, args);
    });
    return true;
  }

  private insertAncestors(newNodes: Node3D[], args: ForceShowArgs): boolean {
    if (newNodes.length === 0) {
      return false;
    }
    // Check the first, it must be the root
    const rootNode = newNodes[0];
    if (rootNode.id !== this.id) {
      throw new Error('The root node is not the same as the current node');
    }
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let parent: CadTreeNode = this;
    for (let i = 1; i < newNodes.length; i++) {
      const newNode = newNodes[i];
      const child = parent.getChildByNodeId(newNode.id);
      if (child !== undefined) {
        parent = child; // The node exist in the tree
      }
      const cadTreeNode = new CadTreeNode(newNode);
      if (args.onLoaded !== undefined) {
        args.onLoaded(cadTreeNode, parent);
      }
      cadTreeNode.needLoadChildren = true; // Maybe wrong if the loadedNode is the last
      parent.addChild(cadTreeNode);
      parent = cadTreeNode;
      // TODO: Force show?????
    }
    return true;
  }
}

type ForceShowArgs = {
  nodeId: number;
  sdk: CogniteClient;
  revisionId: RevisionId;
  onLoaded?: OnLoadedAction;
};
