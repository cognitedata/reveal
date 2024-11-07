/*!
 * Copyright 2024 Cognite AS
 */

import { TreeNode } from '../../..';
import type { Node3D } from '@cognite/sdk';

export class CadTreeNode extends TreeNode {
  private readonly _nodeId: number;
  private readonly _treeIndex: number;
  private _loadSiblingCursor?: string;

  constructor(node: Node3D) {
    super();
    this._nodeId = node.id;
    this._treeIndex = node.treeIndex;
    this.label = node.name === '' ? node.id.toString() : node.name;
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
}
