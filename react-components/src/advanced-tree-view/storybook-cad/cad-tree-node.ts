/*!
 * Copyright 2025 Cognite AS
 */
import { TreeNode } from '..';

import { type SubsetOfNode3D } from './types';

export class CadTreeNode extends TreeNode {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _nodeId: number;
  private readonly _treeIndex: number;
  private _loadSiblingCursor?: string;

  // ==================================================
  // CONSTRUCTORS
  // ==================================================

  constructor(node: SubsetOfNode3D) {
    super();
    this._nodeId = node.id;
    this._treeIndex = node.treeIndex;
    this.label = node.name === '' ? node.id.toString() : node.name;
    this.needLoadChildren = node.subtreeSize > 1;
  }

  // ==================================================
  // Getter and setters
  // ==================================================

  public override get id(): string {
    return CadTreeNode.treeIndexToString(this.treeIndex);
  }

  public get nodeId(): number {
    return this._nodeId;
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
    return child.nodeId === this.nodeId && child.treeIndex === this.treeIndex;
  }

  // ==================================================
  // INSTANCE METHODS: Access methods
  // ==================================================

  public getChildByNodeId(nodeId: number): CadTreeNode | undefined {
    for (const child of this.getChildrenByType(CadTreeNode)) {
      if (child.nodeId === nodeId) {
        return child;
      }
    }
  }

  public getThisOrDescendantByNodeId(nodeId: number): CadTreeNode | undefined {
    for (const descendant of this.getThisAndDescendantsByType(CadTreeNode)) {
      if (descendant.nodeId === nodeId) {
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
  // STATIC METHODS:
  // ==================================================

  /**
   * This function ensure same conversion of treeIndex to string
   * @param treeIndex - The tree index to convert to string
   * @returns The tree index as a string
   */
  public static treeIndexToString(treeIndex: number): string {
    return treeIndex.toString();
  }
}
