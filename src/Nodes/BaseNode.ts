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

import { UniqueId } from "../Core/UniqueId";
import { Identifiable } from "../Core/Identifiable";
import { NodeEventArgs } from "../Architecture/NodeEventArgs";

export abstract class BaseNode extends Identifiable
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  protected constructor() { super(); }

  //==================================================
  // FIELDS
  //==================================================

  private _name: string = "";
  private _isActive: boolean = false;
  private _uniqueId: UniqueId = UniqueId.new();
  private _children: BaseNode[] = [];
  private _parent: BaseNode | null = null;

  //==================================================
  // PROPERTIES
  //==================================================

  public get uniqueId(): UniqueId { return this._uniqueId; }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return BaseNode.name }
  public /*override*/ isA(className: string): boolean { return className === BaseNode.name || super.isA(className); }

  //==================================================
  // VIRTUAL METHODS
  //==================================================

  public /*virtual*/ get name(): string { return this._name; }
  public /*virtual*/ set name(value: string) { this._name = value; }

  public /*virtual*/ get isActive(): boolean { return this._isActive; }
  public /*virtual*/ set isActive(value: boolean) { this._isActive = value; }
  public /*virtual*/ get getBeActive() { return false; } // To be overridden

  protected /*virtual*/ initializeCore(): void { }
  protected /*virtual*/ notifyCore(args: NodeEventArgs): void { }

  public  /*virtual*/ removeInteractive(): void
  {
    const parent = this.parent
    this.remove();
    parent!.notify(new NodeEventArgs(NodeEventArgs.childDeleted));
  }

  //==================================================
  // PROPERTIES: Child-Parent relationship
  //==================================================

  public get children(): BaseNode[] { return this._children; }
  public get childCount(): number { return this._children.length; }
  public get childIndex(): number { return !this.parent ? -1 : this.parent.children.indexOf(this, 0); }
  public get parent(): BaseNode | null { return this._parent; }
  public get root(): BaseNode { return this.parent != null ? this.parent.root : this; }
  public get hasParent(): boolean { return this._parent != null; }

  //==================================================
  // INSTANCE METHODS: Get a child
  //==================================================

  public getChild(index: number): BaseNode { return this._children[index]; }

  public getChildOfName(name: string): BaseNode | null
  {
    for (const child of this.children)
      if (child.name === name)
        return child;
    return null;
  }

  public getChildOfUniqueId(uniqueId: UniqueId): BaseNode | null
  {
    for (const child of this.children)
      if (child.uniqueId === uniqueId)
        return child;
    return null;
  }

  public getChildOfUniqueIdRecursive(uniqueId: UniqueId): BaseNode | null
  {
    for (const child of this.children)
    {
      if (child.uniqueId === uniqueId)
        return child;

      const ancestor = child.getChildOfUniqueIdRecursive(uniqueId);
      if (ancestor)
        return ancestor;
    }
    return null;
  }

  public getChildOfType<T extends BaseNode>(constructor: new() => T): T | null
  {
    for (const child of this.children)
      if (child instanceof constructor)
        return child;
    return null;
  }

  public *getChildrenByType<T extends BaseNode>(constructor: new() => T)
  {
    for (const child of this.children)
      if (child instanceof constructor)
        yield child;
  }

  public getActiveDescendantByClassName(className: string): BaseNode | null
  {
    for (const child of this.children)
    {
      if (child.isActive && child.isA(className))
        return child;

      const descendant = child.getActiveDescendantByClassName(className);
      if (descendant)
        return descendant;
    }
    return null;
  }

  //==================================================
  // INSTANCE METHODS: Get descendants
  //==================================================

  public *getDescendants()
  {
    for (const child of this.children)
    {
      yield child;
      for (const descendant of child.getDescendants())
      {
        const copy: BaseNode = descendant;
        yield copy;
      }
    }
  }

  public *getDescendantsByType<T extends BaseNode>(constructor: new() => T)
  {
    for (const child of this.children)
    {
      if (child instanceof constructor)
        yield child;

      for (const descendant of child.getDescendantsByType<T>(constructor))
      {
        const copy: BaseNode = descendant;
        if (copy instanceof constructor)
          yield copy;
      }
    }
  }

  public *getThisAndDescendants()
  {
    yield this;
    for (const descendant of this.getDescendants())
      yield descendant;
  }

  //==================================================
  // INSTANCE METHODS: Get ancestors
  //==================================================

  public *getAncestors()
  {
    let ancestor = this.parent;
    while (ancestor)
    {
      yield ancestor;
      ancestor = ancestor.parent;
    }
  }

  public *getThisAndAncestors()
  {
    yield this;
    for (const ancestor of this.getAncestors())
      yield ancestor;
  }

  //==================================================
  // INSTANCE METHODS: Child-Parent relationship
  //==================================================

  public addChild(child: BaseNode): void
  {
    this._children.push(child);
    child._parent = this;
  }

  public remove(): boolean
  {
    if (!this.parent)
      return false;

    const index = this.childIndex;
    if (index < 0)
      return false;

    this.parent.children.splice(index, 1);
    this._parent = null;
    return true;
  }

  //==================================================
  // INSTANCE METHODS: Misc
  //==================================================

  public notify(args: NodeEventArgs): void
  {
    this.notifyCore(args);
  }

  public initialize(): void
  {
    this.initializeCore();
  }
}
