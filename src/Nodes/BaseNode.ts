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

import { ViewList } from "../Architecture/ViewList";
import { NodeEventArgs } from "../Architecture/NodeEventArgs";
import { IVisibilityContext } from "../Architecture/IVisibilityContext";
import { UniqueId } from "../Core/UniqueId";
import { TargetId } from "../Core/TargetId";
import { BaseRenderStyle } from "../Styles/BaseRenderStyle";
import { TargetNode } from "../Nodes/TargetNode";
import { Identifiable } from "../Core/Identifiable";
import { RootNode } from "./RootNode";
import { BaseNodeImpl } from "./BaseNodeImpl";
import { RenderStyleResolution } from "./Core/RenderStyleResolution";

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
  private _views: ViewList = new ViewList();
  private _drawStyles: Array<BaseRenderStyle> = new Array<BaseRenderStyle>();
  private _children: Array<BaseNode> = new Array<BaseNode>();
  private _parent: BaseNode | null = null;

  //==================================================
  // PROPERTIES
  //==================================================

  public get views(): ViewList { return this._views; }
  public get drawStyles(): Array<BaseRenderStyle> { return this._drawStyles; }
  public get uniqueId(): UniqueId { return this._uniqueId; }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return BaseNode.name }
  public /*override*/ isA(className: string): boolean { return className == BaseNode.name || super.isA(className); }

  //==================================================
  // VIRTUAL METHODS
  //==================================================

  public /*virtual*/ get name(): string { return this._name; }
  public /*virtual*/ set name(value: string) { this._name = value; }

  public /*virtual*/ get isActive(): boolean { return this._isActive; }
  public /*virtual*/ set isActive(value: boolean) { this._isActive = value; }
  public /*virtual*/ get getBeActive() { return false; } // To be overridden

  protected /*virtual*/ initializeCore(): void { }

  //==================================================
  // PROPERTIES: Child-Parent relationship
  //==================================================

  public get children(): Array<BaseNode> { return this._children; }
  public get childCount(): number { return this._children.length; }
  public get childIndex(): number { return !this.parent ? -1 : this.parent.children.indexOf(this, 0); }
  public get parent(): BaseNode | null { return this._parent; }
  public get ancestor(): BaseNode { return this.parent != null ? this.parent.ancestor : this; }
  public get root(): RootNode { return this.ancestor as RootNode; }
  public get hasParent(): boolean { return this._parent != null; }

  //==================================================
  // INSTANCE METHODS: Get a child
  //==================================================

  public getChild(index: number): BaseNode { return this._children[index]; }

  public getChildOfName(name: string): BaseNode | null
  {
    for (const child of this.children)
      if (child.name == name)
        return child;
    return null;
  }

  public getChildOfUniqueId(uniqueId: UniqueId): BaseNode | null
  {
    for (const child of this.children)
      if (child.uniqueId == uniqueId)
        return child;
    return null;
  }

  public getChildOfUniqueIdRecursive(uniqueId: UniqueId): BaseNode | null
  {
    for (const child of this.children)
    {
      if (child.uniqueId == uniqueId)
        return child;

      const ancestor = child.getChildOfUniqueIdRecursive(uniqueId);
      if (ancestor)
        return ancestor;
    }
    return null;
  }

  public getChildOfType<T extends BaseNode>(constructor: { new(): T }): T | null
  {
    for (const child of this.children)
      if (child instanceof constructor)
        return child;
    return null;
  }

  public *getChildrenByType<T extends BaseNode>(constructor: { new(): T })
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

  public *getDescendantsByType<T extends BaseNode>(constructor: { new(): T })
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

  public removeInteractive(): void
  {
    const parent = this.parent
    this.removeAllViews();
    this.remove();
    parent!.notify(new NodeEventArgs(NodeEventArgs.childDeleted));
  }

  //==================================================
  // INSTANCE METHODS: Visibility and notifying
  //==================================================

  protected notifyCore(args: NodeEventArgs) /*VIRTUAL*/: void { }

  public canBeVisible(target: IVisibilityContext | null): boolean
  {
    target ? target : TargetNode.getActive(this);
    return target ? target.canShowView(this) : false;
  }

  public isVisible(target: IVisibilityContext | null): boolean
  {
    target ? target : TargetNode.getActive(this);
    return target ? target.isVisibleView(this) : false;
  }

  public setVisible(visible: boolean, target: IVisibilityContext | null): boolean
  {
    // Returns true if changed.
    target ? target : TargetNode.getActive(this);
    if (!target)
      return false;
    if (visible)
      return target.showView(this)
    else
      return target.hideView(this);
  }

  public setVisibleInteractive(visible: boolean, target: IVisibilityContext | null): void
  {
    target ? target : TargetNode.getActive(this);
    if (!target)
      return;
    if (this.setVisible(visible, target))
      this.notify(new NodeEventArgs(NodeEventArgs.nodeVisible))
  }

  public notify(args: NodeEventArgs): void
  {
    this.notifyCore(args);
    for (const view of this._views.list)
      view.update(args);
  }

  public removeAllViews(): void
  {
    for (const view of this.views.list)
    {
      const target = view.getTarget();
      if (!target)
        continue;

      target.removeViewShownHere(view);
    }
    this.views.clear();
  }

  //==================================================
  // VIRUAL METHODS: Draw styles
  //==================================================

  public /*virtual*/ createRenderStyle(targetId: TargetId): BaseRenderStyle | null { return null; }
  public /*virtual*/ verifyRenderStyle(style: BaseRenderStyle) { /* overide when validating the drawstyle*/ }
  public /*virtual*/ get drawStyleResolution(): RenderStyleResolution { return RenderStyleResolution.Unique; }
  public /*virtual*/ get drawStyleRoot(): BaseNode | null { return null; } // To be overridden

  //==================================================
  // INSTANCE METHODS: Misc
  //==================================================

  public initialize(): void
  {
    this.initializeCore();
  }

  //==================================================
  // INSTANCE METHODS: Draw styles
  //==================================================

  public getRenderStyle(targetId: TargetId | null): BaseRenderStyle | null 
  {
    return BaseNodeImpl.getRenderStyle(this, targetId);
  }
}


