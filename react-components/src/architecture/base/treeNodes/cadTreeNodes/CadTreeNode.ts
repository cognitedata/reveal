/*!
 * Copyright 2024 Cognite AS
 */

import { TreeNode } from '../TreeNode';
import { type OnLoadedAction, type SubsetOfNode3D } from './types';

export class CadTreeNode extends TreeNode {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _id: number;
  private readonly _treeIndex: number;
  private _loadSiblingCursor?: string;

  // ==================================================
  // CONSTRUCTORS
  // ==================================================

  constructor(node: SubsetOfNode3D) {
    super();
    this._id = node.id;
    this._treeIndex = node.treeIndex;
    this.label = node.name === '' ? node.id.toString() : node.name;
    this.needLoadChildren = node.subtreeSize > 1;
  }

  // ==================================================
  // CONSTRUCTORS: Getter and setters
  // ==================================================

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

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override areEqual(child: TreeNode): boolean {
    if (!(child instanceof CadTreeNode)) {
      return false;
    }
    return child.id === this.id && child.treeIndex === this.treeIndex;
  }

  // ==================================================
  // INSTANCE METHODS: Access methods
  // ==================================================

  public getChildByNodeId(nodeId: number): CadTreeNode | undefined {
    for (const child of this.getChildrenByType(CadTreeNode)) {
      if (child.id === nodeId) {
        return child;
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

  // ==================================================
  // INSTANCE METHODS: Misc
  // ==================================================

  public insertAncestors(
    newNodes: SubsetOfNode3D[],
    onLoaded?: OnLoadedAction
  ): CadTreeNode | undefined {
    // Returns the last create node
    // Note: New nodes are always added last among the children
    if (newNodes.length === 0) {
      return undefined;
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
        continue;
      }
      // Create a new node
      const cadTreeNode = new CadTreeNode(newNode);
      if (onLoaded !== undefined) {
        onLoaded(cadTreeNode, parent);
      }
      const lastChild = parent.getLastChild() as CadTreeNode;
      // Give the cursor from the last child to the new node
      if (lastChild !== undefined && lastChild.needLoadSiblings) {
        cadTreeNode.loadSiblingCursor = lastChild.loadSiblingCursor;
        lastChild.loadSiblingCursor = undefined;
      }
      parent.addChild(cadTreeNode);
      parent = cadTreeNode;
    }
    return parent;
  }
}
