/*!
 * Copyright 2025 Cognite AS
 */
import { type Node3D } from '@cognite/sdk';

import { type TreeNodeType, type ILazyLoader } from '..';

import { CadTreeNode } from './cad-tree-node';
import { type ICogniteClient } from './i-cognite-client';
import { type RevisionId, type SubsetOfNode3D } from './types';

export class CadNodesLoader implements ILazyLoader {
  private readonly _sdk: ICogniteClient;
  private readonly _revisionId: RevisionId;
  private _root: CadTreeNode | undefined;
  private readonly _listNodesLimit: number;

  public get root(): TreeNodeType | undefined {
    return this._root;
  }

  constructor(sdk: ICogniteClient, revisionId: RevisionId, listNodesLimit = 100) {
    this._sdk = sdk;
    this._revisionId = revisionId;
    this._listNodesLimit = listNodesLimit;
  }

  public onNodeLoaded(_child: TreeNodeType, _parent?: TreeNodeType): void {}

  public async loadInitialRoot(): Promise<TreeNodeType> {
    if (this._root !== undefined) {
      return this._root;
    }
    const rootNodeObjResponse = await this._sdk.list3DNodes(
      this._revisionId.modelId,
      this._revisionId.revisionId,
      {
        depth: 0,
        limit: 1
      }
    );
    const rootNode = rootNodeObjResponse.items[0];
    const root = new CadTreeNode(rootNode);
    root.isExpanded = true;
    this._root = root;
    return this._root;
  }

  public async loadChildren(parent: TreeNodeType): Promise<TreeNodeType[] | undefined> {
    if (!(parent instanceof CadTreeNode)) {
      return undefined;
    }
    const data = await this._sdk.list3DNodes(
      this._revisionId.modelId,
      this._revisionId.revisionId,
      {
        depth: 1,
        limit: this._listNodesLimit,
        nodeId: parent.nodeId
      }
    );
    data.items = data.items.filter((responseNode) => responseNode.id !== parent.nodeId);

    const treeNodes: TreeNodeType[] = data.items.map((node) => {
      return new CadTreeNode(node);
    });

    if (data.nextCursor !== undefined) {
      const lastNode = treeNodes[treeNodes.length - 1];
      if (lastNode instanceof CadTreeNode) {
        lastNode.loadSiblingCursor = data.nextCursor;
      }
    }
    return treeNodes;
  }

  public async loadSiblings(sibling: TreeNodeType): Promise<TreeNodeType[] | undefined> {
    if (!(sibling instanceof CadTreeNode)) {
      return undefined;
    }
    if (!(sibling.parent instanceof CadTreeNode)) {
      throw new Error('Parent node id is undefined');
    }
    const data = await this._sdk.list3DNodes(
      this._revisionId.modelId,
      this._revisionId.revisionId,
      {
        depth: 1,
        limit: this._listNodesLimit,
        nodeId: sibling.parent?.nodeId,
        cursor: sibling.loadSiblingCursor
      }
    );
    const treeNodes: TreeNodeType[] = data.items.map((node) => {
      return new CadTreeNode(node);
    });

    if (data.nextCursor !== undefined) {
      const lastNode = treeNodes[treeNodes.length - 1];
      if (lastNode instanceof CadTreeNode) {
        lastNode.loadSiblingCursor = data.nextCursor;
      }
    }
    return treeNodes;
  }

  public async forceNodeInTree(nodeId: number): Promise<TreeNodeType | undefined> {
    const root = this._root;
    if (root === undefined) {
      return undefined;
    }
    const treeNode = root.getThisOrDescendantByNodeId(nodeId);
    if (treeNode !== undefined) {
      treeNode.expandAllAncestors();
      return treeNode; // already in the tree
    }
    return await this.list3DNodeAncestors(nodeId).then((cdfNodes: Node3D[]) => {
      if (root === undefined) {
        return undefined;
      }
      const newTreeNode = this.insertAncestors(root, cdfNodes);
      if (newTreeNode === undefined) {
        return undefined; // This should not happen
      }
      // A new now is created
      newTreeNode.expandAllAncestors();
      return newTreeNode;
    });
  }

  // ==================================================
  // INSTANCE METHODS: Misc
  // ==================================================

  private async list3DNodeAncestors(nodeId: number): Promise<Node3D[]> {
    const data = await this._sdk.list3DNodeAncestors(
      this._revisionId.modelId,
      this._revisionId.revisionId,
      nodeId
    );
    return data.items;
  }

  private insertAncestors(
    root: CadTreeNode,
    newCdfNodes: SubsetOfNode3D[]
  ): CadTreeNode | undefined {
    // Returns the last create node
    // Note: New nodes are always added last among the children
    if (newCdfNodes.length === 0) {
      return undefined;
    }
    // Check the first, it must be the root
    const cdfRoot = newCdfNodes[0];
    if (cdfRoot.id !== root.nodeId) {
      throw new Error('The root node is not the same as the current node');
    }
    let parent = root;
    for (let i = 1; i < newCdfNodes.length; i++) {
      const cdfNode = newCdfNodes[i];

      const child = parent.getChildByNodeId(cdfNode.id);
      if (child !== undefined) {
        parent = child; // The node exist in the tree
        continue;
      }
      // Create a new node
      const newNode = new CadTreeNode(cdfNode);
      const lastChild = parent.getLastChild() as CadTreeNode;

      // Give the cursor from the last child to the new node
      if (lastChild?.needLoadSiblings) {
        newNode.loadSiblingCursor = lastChild.loadSiblingCursor;
        lastChild.loadSiblingCursor = undefined;
      }
      parent.addChild(newNode);
      if (parent.needLoadChildren) {
        parent.needLoadChildren = false;
        parent.needLoadSiblings = true;
      }
      newNode.needLoadSiblings = true;
      this.onNodeLoaded?.(newNode, parent);
      parent = newNode;
    }
    return parent;
  }
}
