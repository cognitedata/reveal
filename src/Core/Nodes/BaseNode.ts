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

import { UniqueId } from "../PrimitivClasses/UniqueId";
import { Identifiable } from "../PrimitivClasses/Identifiable";
import { TargetId } from "../PrimitivClasses/TargetId";
import { isInstanceOf, Class } from "../PrimitivClasses/ClassT";
import { RenderStyleResolution } from "../Enums/RenderStyleResolution";
import { NodeEventArgs } from "../Views/NodeEventArgs";
import { TargetIdAccessor } from "../Interfaces/TargetIdAccessor";
import { BaseRenderStyle } from "../Styles/BaseRenderStyle";
import * as color from 'color'
import { ColorType } from "../Enums/ColorType";
import { Colors } from "../PrimitivClasses/Colors";

export abstract class BaseNode extends Identifiable
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  protected constructor() { super(); }

  //==================================================
  // FIELDS
  //==================================================

  private _color: color | undefined = undefined;
  private _name: string | undefined = undefined;

  private _isActive: boolean = false;
  private _isInitialized: boolean = false;

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
  public get isInitialized(): boolean { return this._isInitialized; }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return BaseNode.name }
  public /*override*/ isA(className: string): boolean { return className === BaseNode.name || super.isA(className); }
  public /*override*/ toString(): string { return this.getDebugString(); }

  //==================================================
  // VIRTUAL FUNCTIONS
  //==================================================

  public abstract get typeName(): string;
  public /*virtual*/ set name(value: string) { this._name = value; }
  public /*virtual*/ get name(): string { if (this._name === undefined) this._name = this.generateNewName(); return this._name; }
  public /*virtual*/ get canChangeName(): boolean { return true; }

  public /*virtual*/ get color(): color { if (this._color === undefined) this._color = this.generateNewColor(); return this._color; }
  public /*virtual*/ set color(value: color) { this._color = value; }
  public /*virtual*/ get canChangeColor() { return true; }

  public /*virtual*/ get isActive(): boolean { return this._isActive; }
  public /*virtual*/ set isActive(value: boolean) { this._isActive = value; }
  public /*virtual*/ get canBeActive(): boolean { return false; }

  protected /*virtual*/ initializeCore(): void { }
  protected /*virtual*/ notifyCore(args: NodeEventArgs): void { }

  protected /*virtual*/ removeInteractiveCore(): void { }

  protected /*virtual*/ get activeTargetIdAccessor(): TargetIdAccessor | null
  {
    const root = this.root;
    return root ? root.activeTargetIdAccessor : null;
  }

  public /*virtual*/ getDebugString(): string
  {
    let result = this.name;
    result += cocatinate("typeName", this.typeName);
    result += cocatinate("className", this.className);
    if (this.canChangeColor)
      result += cocatinate("color", this.color);
    result += cocatinate("id", this.uniqueId);
    if (this.isActive)
      result += cocatinate("active");
    if (this.drawStyles.length > 0)
      result += cocatinate("drawstyles", this.drawStyles.length);
    return result;
  }

  //==================================================
  // VIRUAL METHODS: Draw styles
  //==================================================

  public /*virtual*/ createRenderStyle(targetId: TargetId): BaseRenderStyle | null { return null; }
  public /*virtual*/ verifyRenderStyle(style: BaseRenderStyle) { /* overide when validating the drawstyle*/ }
  public /*virtual*/ get drawStyleResolution(): RenderStyleResolution { return RenderStyleResolution.Unique; }
  public /*virtual*/ get drawStyleRoot(): BaseNode | null { return null; } // To be overridden
  public /*override*/ supportsColorType(colorType: ColorType): boolean { return true; } // To be overridden

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
  // INSTANCE METHODS: Get a child or children
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

  public getActiveChildByType<T>(classType: Class<T>): T | null
  {
    for (const child of this.children)
    {
      if (child.isActive && isInstanceOf(child, classType))
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

  public getAncestorByType<T>(classType: Class<T>): T | null
  {
    for (const ancestor of this.getAncestors())
    {
      if (ancestor.isActive && isInstanceOf(ancestor, classType))
        return ancestor as T;
    }
    return null;
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
    if (this._isInitialized)
      return; // This should be done once
    this.initializeCore();
    this._isInitialized = true;
  }

  public initializeRecursive(): void
  {
    this.initialize();
    for (const child of this.children)
      child.initializeRecursive();
  }

  public removeInteractive(): void
  {
    // To be called when a node is removed
    // It is not finished, because the children it not taken properly casr of
    this.removeInteractiveCore();
    const parent = this.parent
    this.remove();
    parent!.notify(new NodeEventArgs(NodeEventArgs.childDeleted));
  }

  public setActiveInteractive(): void
  {
    // To be called when a object should be active
    if (this.isActive)
      return;

    if (!this.canBeActive)
      return;

    if (this.parent)
    {
      // Turn the others off
      for (const child of this.parent.children)
      {
        if (child === this)
          continue;
        if (child.className !== this.className)
          continue;
        if (!child.canBeActive)
          return;
        if (!child.isActive)
          continue;

        child.isActive = false;
        child.notify(new NodeEventArgs(NodeEventArgs.active));
      }
    }
    this.isActive = true;
    this.notify(new NodeEventArgs(NodeEventArgs.active));
  }

  //==================================================
  // INSTANCE METHODS: Draw styles
  //==================================================

  public getRenderStyle(targetId?: TargetId | null): BaseRenderStyle | null
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
  // INSTANCE METHODS: Some helpers
  //==================================================

  protected generateNewColor(): color
  {
    return this.canChangeColor ? Colors.nextColor : Colors.white;
  }

  protected generateNewName(): string
  {
    let result = this.typeName;
    if (!this.canChangeName)
      return result

    const childIndex = this.childIndex;
    if (childIndex === undefined)
      return result;

    result += " " + (childIndex + 1);
    return result
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

export function cocatinate(name: string, value?: any): string
{
  if (value === undefined || value === null)
    return ", " + name;
  return ", " + name + ": " + value;
}

