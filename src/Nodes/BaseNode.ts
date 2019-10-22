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
import { TargetId } from "../Core/TargetId";
import { isInstanceOf, Class } from "../Core/ClassT";
import { RenderStyleResolution } from "../Core/RenderStyleResolution";
import { NodeEventArgs } from "../Architecture/NodeEventArgs";
import { TargetIdAccessor } from "../Architecture/TargetIdAccessor";
import { BaseRenderStyle } from "../Styles/BaseRenderStyle";

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
  private _drawStyles: BaseRenderStyle[] = [];

  //==================================================
  // PROPERTIES
  //==================================================

  public get uniqueId(): UniqueId { return this._uniqueId; }
  public get drawStyles(): BaseRenderStyle[] { return this._drawStyles; }
  public get path(): string { return (this.parent ? this.parent.path : "") + "\\" + this.name; }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return BaseNode.name }
  public /*override*/ isA(className: string): boolean { return className === BaseNode.name || super.isA(className); }
  public /*override*/ toString(): string { return `${this.name}, className: ${this.className}, id: ${this.uniqueId}${this.isActive ? " (Active)" : ""}`; }

  //==================================================
  // VIRTUAL METHODS
  //==================================================

  public /*virtual*/ get name(): string { return this._name; }
  public /*virtual*/ set name(value: string) { this._name = value; }

  public /*virtual*/ get isActive(): boolean { return this._isActive; }
  public /*virtual*/ set isActive(value: boolean) { this._isActive = value; }
  public /*virtual*/ get canBeActive() { return false; }

  protected /*virtual*/ initializeCore(): void { }
  protected /*virtual*/ notifyCore(args: NodeEventArgs): void { }

  protected /*virtual*/ removeInteractiveCore(): void { }

  public /*virtual*/ get activeTargetIdAccessor(): TargetIdAccessor | null
  {
    const root = this.root;
    return root ? root.activeTargetIdAccessor : null;
  }

  //==================================================
  // VIRUAL METHODS: Draw styles
  //==================================================

  public /*virtual*/ createRenderStyle(targetId: TargetId): BaseRenderStyle | null { return null; }
  public /*virtual*/ verifyRenderStyle(style: BaseRenderStyle) { /* overide when validating the drawstyle*/ }
  public /*virtual*/ get drawStyleResolution(): RenderStyleResolution { return RenderStyleResolution.Unique; }
  public /*virtual*/ get drawStyleRoot(): BaseNode | null { return null; } // To be overridden

  //==================================================
  // PROPERTIES: Child-Parent relationship
  //==================================================

  public get children(): BaseNode[] { return this._children; }
  public get childCount(): number { return this._children.length; }
  public get childIndex(): number | undefined { return !this.parent ? undefined : this.parent.children.indexOf(this); }
  public get parent(): BaseNode | null { return this._parent; }
  public get root(): BaseNode { return this.parent != null ? this.parent.root : this; }
  public get hasParent(): boolean { return this._parent != null; }

  //==================================================
  // INSTANCE METHODS: Get a child
  //==================================================

  public getChild(index: number): BaseNode { return this._children[index]; }

  public getChildByName(name: string): BaseNode | null
  {
    for (const child of this.children)
      if (child.name === name)
        return child;
    return null;
  }

  public getChildByUniqueId(uniqueId: UniqueId): BaseNode | null
  {
    for (const child of this.children)
      if (child.uniqueId.equals(uniqueId))
        return child;
    return null;
  }

  public getChildByType<T extends BaseNode>(classType: Class<T>): T | null
  {
    for (const child of this.children)
    {
      if (isInstanceOf(child, classType))
        return child as T;
    }
    return null;
  }

  public *getChildrenByType<T extends BaseNode>(classType: Class<T>)
  {
    for (const child of this.children)
      if (isInstanceOf(child, classType))
        yield child as T;
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

  public *getThisAndDescendants()
  {
    yield this;
    for (const descendant of this.getDescendants())
      yield descendant;
  }

  public *getDescendantsByType<T extends BaseNode>(classType: Class<T>)
  {
    for (const child of this.children)
    {
      if (isInstanceOf(child, classType))
        yield child as T;

      for (const descendant of child.getDescendantsByType<T>(classType))
      {
        const copy: BaseNode = descendant;
        if (isInstanceOf(copy, classType))
          yield copy as T;
      }
    }
  }

  public getActiveDescendantByType<T>(classType: Class<T>): T | null
  {
    for (const child of this.children)
    {
      if (child.isActive && isInstanceOf(child, classType))
        return child as T;

      const descendant = child.getActiveDescendantByType(classType);
      if (descendant)
        return descendant as T;
    }
    return null;
  }

  public getDescendantByUniqueId(uniqueId: UniqueId): BaseNode | null
  {
    for (const child of this.children)
    {
      if (child.uniqueId.equals(uniqueId))
        return child;

      const ancestor = child.getDescendantByUniqueId(uniqueId);
      if (ancestor)
        return ancestor;
    }
    return null;
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
    if (index === undefined)
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

  public removeInteractive(): void
  {
    this.removeInteractiveCore();
    const parent = this.parent
    this.remove();
    parent!.notify(new NodeEventArgs(NodeEventArgs.childDeleted));
  }

  //==================================================
  // INSTANCE METHODS: Draw styles
  //==================================================

  public getRenderStyle(targetId: TargetId | null): BaseRenderStyle | null 
  {
    const root = this.drawStyleRoot;
    if (root != null && root !== this)
      return root.getRenderStyle(targetId);

    // Find the targetId if not present
    if (!targetId)
    {
      const target = this.activeTargetIdAccessor;
      if (target)
        targetId = target.targetId;
      else
        return null;
      if (!targetId)
        return null;
    }
    // Find the style in the node itself
    let style: BaseRenderStyle | null = null;
    for (const thisStyle of this.drawStyles)
    {
      if (thisStyle.isDefault)
        continue;

      if (!thisStyle.targetId.equals(targetId, this.drawStyleResolution))
        continue;

      style = thisStyle;
      break;
    }
    // If still not find and unique, copy one of the existing
    if (!style && this.drawStyleResolution === RenderStyleResolution.Unique)
    {
      for (const thisStyle of this.drawStyles)
      {
        if (thisStyle.isDefault)
          continue;

        if (!thisStyle.targetId.hasSameTypeName(targetId))
          continue;

        style = thisStyle.copy();
        style.isDefault = false;
        style.targetId.set(targetId, this.drawStyleResolution);
        this.drawStyles.push(style);
        break;
      }
    }
    // If still not found: Create it
    if (!style)
    {
      style = this.createRenderStyle(targetId);
      if (style)
      {
        style.targetId.set(targetId, this.drawStyleResolution);
        this.drawStyles.push(style);
      }
    }
    if (style)
      this.verifyRenderStyle(style);
    return style;
  }

  //==================================================
  // INSTANCE METHODS: Debugging
  //==================================================

  public toHierarcyString(): string
  {
    let text = "";
    for (const node of this.getThisAndDescendants())
    {
      let padding = 0;
      for (const { } of node.getAncestors())
        padding++;
      const line = " ".padStart(padding * 4) + node.toString() + "\n";
      text += line;
    }
    return text;
  }

  // tslint:disable-next-line: no-console
  public debugHierarcy(): void { console.log(this.toHierarcyString()); }
}


  //==================================================
  // OLD TEMPLATE ACCESS CODE: Good to have
  //==================================================

  // public getChildOfType<T extends BaseNode>(constructor: new () => T): T | null
  // {
  //   for (const child of this.children)
  //   {
  //     if (child instanceof constructor)
  //       return child;
  //   }
  //   return null;
  // }

  // public *getChildrenByType<T extends BaseNode>(constructor: new () => T)
  // {
  //   for (const child of this.children)
  //     if (child instanceof constructor)
  //       yield child;
  // }

  // public *getDescendantsByType<T extends BaseNode>(constructor: new () => T)
  // {
  //   for (const child of this.children)
  //   {
  //     if (child instanceof constructor)
  //       yield child;

  //     for (const descendant of child.getDescendantsByType<T>(constructor))
  //     {
  //       const copy: BaseNode = descendant;
  //       if (copy instanceof constructor)
  //         yield copy;
  //     }
  //   }
  // }

