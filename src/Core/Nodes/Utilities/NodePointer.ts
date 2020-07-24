//=====================================================================================
// This code is part of the Reveal Viewer architecture, made by Nils Petter Fremming  
// in October 2019. It is suited for flexible and customizable visualization of   
// multiple dataset in multiple viewers.
//
// It is a C# to typescript port from the Modern Model architecture,   
// based on the experience when building Petrel.  
//
// NOTE: Always keep the code according to the code style already applied in the file.
// Put new code under the correct section, and make more sections if needed.
// Copyright (c) Cognite AS. All rights reserved.
//=====================================================================================

import { BaseNode } from "@/Core/Nodes/BaseNode";
import { UniqueId } from "@/Core/Primitives/UniqueId";
import { BaseRootNode } from "@/Core/Nodes/BaseRootNode";

export class NodePointer
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private readonly _indexes: number[] = [];
  private _uniqueId: UniqueId | null = null;

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get uniqueId(): UniqueId | null { return this._uniqueId };
  public get isEmpty(): boolean { return !this._uniqueId || this._uniqueId.isEmpty; }
  public get node(): BaseNode | null { return this.getNode(); }

  public set node(value: BaseNode | null)
  {
    this.clearIndexes();
    this._uniqueId = value ? value.uniqueId : null;
  }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public NodePtr(node?: BaseNode) 
  {
    if (node)
      this._uniqueId = node.uniqueId.clone();
  }

  //==================================================
  // STATIC METHODS: Getters
  //==================================================

  public getNode(anyInTheSameTree?: BaseNode): BaseNode | null
  {
    if (this.isEmpty)
      return null;

    if (!this._uniqueId)
      return null;

    var root = this.getRoot(anyInTheSameTree);
    if (!root)
      return null;

    let result = this.getNodeByIndexes(root);
    if (result)
      return result;

    result = root.getDescendantByUniqueId(this._uniqueId);
    if (result == null)
    {
      // Set it invalid
      this.clear();
      return null;
    }
    // Build up the index list for the next time
    this.rebuildIndexes(result, root);
    return result;
  }

  private getRoot(anyInTheSameTree?: BaseNode): BaseNode | null
  {
    return anyInTheSameTree ? anyInTheSameTree.root : BaseRootNode.active;
  }

  private getNodeByIndexes(root: BaseNode): BaseNode | null
  {
    if (this._indexes.length == 0)
      return null;

    var node = root;
    for (let index of this._indexes)
    {
      if (node == null)
        break;

      if (node.children == null)
      {
        this.clearIndexes();
        return null;
      }
      if (index >= node.children.length)
        break;

      node = node.children[index];
    }
    if (node == null)
    {
      this.clearIndexes();
      return null;
    }
    if (node.uniqueId != this._uniqueId)
    {
      this.clearIndexes();
      return null;
    }
    return node;
  }

  //==================================================
  // STATIC METHODS: Operations
  //==================================================

  private clearIndexes(): void
  {
    this._indexes.splice(0, this._indexes.length);
  }

  private clear(): void
  {
    // Set it invalid
    this.clearIndexes();
    this._uniqueId = null;
  }

  private rebuildIndexes(node: BaseNode, root: BaseNode): void
  {
    this.clearIndexes();

    var child = node;
    var parent = child.parent;
    while (parent)
    {
      var index = parent.children.indexOf(child);
      if (index < 0)
        throw new Error("index < 0");

      this._indexes.push(index);
      child = parent;
      parent = child.parent;
    }
    this._indexes.reverse();
    if (this.getNodeByIndexes(root) != node)
      throw new Error("rebuildIndexes doesn't work");
  }
}