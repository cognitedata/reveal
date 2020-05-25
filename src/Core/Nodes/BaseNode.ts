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

import * as color from "color"

import { UniqueId } from "@/Core/Primitives/UniqueId";
import { Identifiable } from "@/Core/Primitives/Identifiable";
import { TargetId } from "@/Core/Primitives/TargetId";
import { isInstanceOf, Class } from "@/Core/Primitives/ClassT";
import { RenderStyleResolution } from "@/Core/Enums/RenderStyleResolution";
import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";
import { TargetIdAccessor } from "@/Core/Interfaces/TargetIdAccessor";
import { BaseRenderStyle } from "@/Core/Styles/BaseRenderStyle";
import { ColorType } from "@/Core/Enums/ColorType";
import { Colors } from "@/Core/Primitives/Colors";
import { Changes } from "@/Core/Views/Changes";
import { CheckBoxState } from "@/Core/Enums/CheckBoxState";
import { Target } from "@/Core/Interfaces/Target";
import { Util } from "@/Core/Primitives/Util";

export abstract class BaseNode extends Identifiable
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  protected constructor() { super(); }

  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private _color: color | undefined = undefined;
  private _name: string | undefined = undefined;
  private _isExpanded = false;

  private _isActive: boolean = false;
  private _isInitialized: boolean = false;

  private _uniqueId: UniqueId = UniqueId.new();
  private _children: BaseNode[] = [];
  private _parent: BaseNode | null = null;
  private _renderStyles: BaseRenderStyle[] = [];

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get uniqueId(): UniqueId { return this._uniqueId; }
  public get renderStyles(): BaseRenderStyle[] { return this._renderStyles; }
  public get path(): string { return (this.parent ? this.parent.path : "") + "\\" + this.name; }
  public get isInitialized(): boolean { return this._isInitialized; }
  public get activeTarget(): Target | null { return this.activeTargetIdAccessor as Target; }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return BaseNode.name }
  public /*override*/ isA(className: string): boolean { return className === BaseNode.name || super.isA(className); }
  public /*override*/ toString(): string { return this.getDebugString(); }

  //==================================================
  // VIRTUAL METHODS: Name
  //==================================================

  public abstract get typeName(): string;
  public /*virtual*/ set name(value: string) { this._name = value; }
  public /*virtual*/ get name(): string { if (this._name === undefined) this._name = this.generateNewName(); return this._name; }
  public /*virtual*/ get canChangeName(): boolean { return true; }
  public /*virtual*/ get nameExtension(): string { return name; }

  //==================================================
  // VIRTUAL METHODS: Label
  //==================================================

  public  /*virtual*/ get isVisibleInTreeControl(): boolean { return true; } // If false, the icon and it children is not shown in the tree control
  public /*virtual*/ get labelColor(): color { return Colors.black; }
  public  /*virtual*/ get isLabelInBold(): boolean { return this.isActive; } // true shows the label in bold font
  public  /*virtual*/ get isLabelInItalic(): boolean { return !this.canBeDeleted; } // true shows the label in italic font

  public get label(): string // This is the text shown in the tree control
  {
    const nameExtension = this.nameExtension;
    if (Util.isEmpty(nameExtension))
      return name;
    return `${name} [${nameExtension}]`;
  }

  //==================================================
  // VIRTUAL METHODS: Color
  //==================================================

  public /*virtual*/ get color(): color { if (this._color === undefined) this._color = this.generateNewColor(); return this._color; }
  public /*virtual*/ set color(value: color) { this._color = value; }
  public /*virtual*/ get canChangeColor() { return true; }

  //==================================================
  // VIRTUAL METHODS: Active
  //==================================================

  public /*virtual*/ get isActive(): boolean { return this._isActive; }
  public /*virtual*/ set isActive(value: boolean) { this._isActive = value; }
  public /*virtual*/ get canBeActive(): boolean { return false; }

  //==================================================
  // VIRTUAL METHODS: Appearance in the explorer
  //==================================================

  public  /*virtual*/ get canBeDeleted(): boolean { return true; }

  public  /*virtual*/ canBeChecked(target: Target | null): boolean { return true; }
  public  /*virtual*/ isFilter(target: Target | null): boolean { return false; }
  public  /*virtual*/ isRadio(target: Target | null): boolean { return false; }

  //==================================================
  // VIRTUAL METHODS: Visibility
  //==================================================

  public /*virtual*/ getCheckBoxState(target?: Target | null): CheckBoxState
  {
    if (!target)
      target = this.activeTarget;

    if (!target)
      return CheckBoxState.Never;

    let numCandidates = 0;
    let numAll = 0;
    let numNone = 0;

    for (const child of this.children)
    {
      const childState = child.getCheckBoxState(target);
      if (childState === CheckBoxState.Never)
        continue;

      numCandidates++;
      if (childState === CheckBoxState.All)
        numAll++;
      else if (childState === CheckBoxState.None)
        numNone++;

      // Optimization, not tested
      if (numNone < numCandidates && numCandidates < numAll)
        return CheckBoxState.Some;
    }
    if (numCandidates === 0)
      return CheckBoxState.Never;
    if (numCandidates === numAll)
      return CheckBoxState.All;
    if (numCandidates === numNone)
      return CheckBoxState.None;
    return CheckBoxState.Some;
  }

  public /*virtual*/ setVisibleInteractive(visible: boolean, target?: Target | null): void
  {
    if (!target)
      target = this.activeTarget;
    if (!target)
      return;
    const checkBoxState = this.getCheckBoxState();
    if (checkBoxState === CheckBoxState.Never)
      return;
    if (checkBoxState === CheckBoxState.None && !this.canBeChecked)
      return;
    for (const child of this.children)
      child.setVisibleInteractive(visible, target);
  }

  public toggleVisibleInteractive(target?: Target | null): void // Use this when clicking on the checkbox in the three control
  {
    const checkBoxState = this.getCheckBoxState(target);
    if (checkBoxState === CheckBoxState.Never)
      return;
    if (checkBoxState === CheckBoxState.None)
      this.setVisibleInteractive(true, target);
    else
      this.setVisibleInteractive(false, target);
  }

  //==================================================
  // VIRTUAL METHODS: Others
  //==================================================

  protected /*virtual*/ initializeCore(): void { }
  protected /*virtual*/ notifyCore(args: NodeEventArgs): void { }
  protected /*virtual*/ removeInteractiveCore(): void { }
  protected /*virtual*/ get activeTargetIdAccessor(): TargetIdAccessor | null
  {
    const root = this.root;
    return root ? root.activeTargetIdAccessor : null;
  }

  //==================================================
  // VIRTUAL METHODS: Draw styles
  //==================================================

  public /*virtual*/ createRenderStyle(targetId: TargetId): BaseRenderStyle | null { return null; }
  public /*virtual*/ verifyRenderStyle(style: BaseRenderStyle) { /* overide when validating the render style*/ }
  public /*virtual*/ get renderStyleResolution(): RenderStyleResolution { return RenderStyleResolution.Unique; }
  public /*virtual*/ get renderStyleRoot(): BaseNode | null { return null; } // To be overridden
  public /*override*/ supportsColorType(colorType: ColorType): boolean { return true; } // To be overridden

  //==================================================
  // INSTANCE METHODS: Expand
  //==================================================

  public get isExpanded(): boolean { return this._isExpanded; }
  public set isExpanded(value: boolean) { this._isExpanded = value; }

  public toggleExpandInteractive() // Use this when clicking on the expand marker in the three control
  {
    this.setExpandedInteractive(!this.isExpanded);
  }

  public setExpandedInteractive(value: boolean)
  {
    if (this.isExpanded === value)
      return false;

    if (!this.canBeExpanded)
      return false;

    this.isExpanded = value;
    this.notify(new NodeEventArgs(Changes.expanded));
    return true;
  }

  public canBeExpanded(): boolean // if true show expander marker
  {
    for (const child of this.children)
    {
      if (child.isVisibleInTreeControl)
        return true;
    }
    return false;
  }

  //==================================================
  // INSTANCE PROPERTIES: Child-Parent relationship
  //==================================================

  public get children(): BaseNode[] { return this._children; }
  public get childCount(): number { return this._children.length; }
  public get childIndex(): number | undefined { return !this.parent ? undefined : this.parent.children.indexOf(this); }
  public get parent(): BaseNode | null { return this._parent; }
  public get root(): BaseNode { return this.parent != null ? this.parent.root : this; }
  public get hasParent(): boolean { return this._parent != null; }

  //==================================================
  // INSTANCE METHODS: Getters
  //==================================================

   public getColorByColorType(colorType: ColorType) {
     switch (colorType)
     {
      case ColorType.NodeColor: return this.color;
      case ColorType.Black: return Colors.black;
      case ColorType.White: return Colors.white;
      default: return Colors.white; // Must be white because texture colors are multiplicative
     }
  }

    //==================================================
  // INSTANCE METHODS: Get a child or children
  //==================================================

  public hasChildByType<T extends BaseNode>(classType: Class<T>): boolean { return this.getChildByType(classType) !== null; }

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

  public getActiveChildByType<T extends BaseNode>(classType: Class<T>): T | null
  {
    for (const child of this.children)
    {
      if (child.isActive && isInstanceOf(child, classType))
        return child as T;
    }
    return null;
  }

  public *getChildrenByType<T extends BaseNode>(classType: Class<T>): Iterable<T>
  {
    for (const child of this.children)
    {
      if (isInstanceOf(child, classType))
        yield child as T;
    }
  }

  //==================================================
  // INSTANCE METHODS: Get descendants
  //==================================================

  public * getDescendants(): Iterable<BaseNode>
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

  public * getThisAndDescendants(): Iterable<BaseNode>
  {
    yield this;
    for (const descendant of this.getDescendants())
      yield descendant;
  }

  public * getDescendantsByType<T extends BaseNode>(classType: Class<T>): Iterable<T>
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

  public getActiveDescendantByType<T extends BaseNode>(classType: Class<T>): T | null
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

  public * getThisAndAncestors(): Iterable<BaseNode>
  {
    let ancestor: BaseNode | null = this;
    while (ancestor)
    {
      yield ancestor;
      ancestor = ancestor.parent;
    }
  }

  public * getAncestors(): Iterable<BaseNode>
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
      if (isInstanceOf(ancestor, classType))
        return ancestor as T;
    }
    return null;
  }

  public getThisOrAncestorByType<T>(classType: Class<T>): T | null
  {
    for (const ancestor of this.getThisAndAncestors())
    {
      if (isInstanceOf(ancestor, classType))
        return ancestor as T;
    }
    return null;
  }

  //==================================================
  // INSTANCE METHODS: Child-Parent relationship
  //==================================================

  public addChild(child: BaseNode): void
  {
    if (child.hasParent)
    {
      Error(`The child ${child.typeName} already has a parent`);
      return;
    }
    if (child === this)
    {
      Error(`Trying to add illegal child ${child.typeName}`);
      return;
    }
    this._children.push(child);
    child._parent = this;
  }

  public remove(): boolean
  {
    if (!this.parent)
    {
      Error(`The child ${this.typeName} don't have a parent`);
      return false;
    }
    const childIndex = this.childIndex;
    if (childIndex === undefined)
    {
      Error(`The child ${this.typeName} is not child of it's parent`);
      return false;
    }
    this.parent.children.splice(childIndex, 1);
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
    // It is not finished, because the children it not taken properly care of
    this.removeInteractiveCore();
    const parent = this.parent;
    this.remove();
    parent!.notify(new NodeEventArgs(Changes.childDeleted));
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
        child.notify(new NodeEventArgs(Changes.active));
      }
    }
    this.isActive = true;
    this.notify(new NodeEventArgs(Changes.active));
  }

  //==================================================
  // INSTANCE METHODS: Draw styles
  //==================================================

  public getRenderStyle(targetId?: TargetId): BaseRenderStyle | null
  {
    const root = this.renderStyleRoot;
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
    for (const thisStyle of this.renderStyles)
    {
      if (thisStyle.isDefault)
        continue;

      if (!thisStyle.targetId.equals(targetId, this.renderStyleResolution))
        continue;

      style = thisStyle;
      break;
    }
    // If still not find and unique, copy one of the existing
    if (!style && this.renderStyleResolution === RenderStyleResolution.Unique)
    {
      for (const thisStyle of this.renderStyles)
      {
        if (thisStyle.isDefault)
          continue;

        if (!thisStyle.targetId.hasSameTypeName(targetId))
          continue;

        style = thisStyle.clone();
        style.isDefault = false;
        style.targetId.set(targetId, this.renderStyleResolution);
        this.renderStyles.push(style);
        break;
      }
    }
    // If still not found: Create it
    if (!style)
    {
      style = this.createRenderStyle(targetId);
      if (style)
      {
        style.targetId.set(targetId, this.renderStyleResolution);
        this.renderStyles.push(style);
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
      return result;

    const childIndex = this.childIndex;
    if (childIndex === undefined)
      return result;

    result += " " + (childIndex + 1);
    return result;
  }

  //==================================================
  // INSTANCE METHODS: Debugging
  //==================================================


  public /*virtual*/ getDebugString(): string
  {
    let result = this.name;
    result += cocatinate("typeName", this.typeName);
    result += cocatinate("className", this.className);
    if (this.canChangeColor)
      result += cocatinate("color", this.color);
    result += cocatinate("id", this.uniqueId.isEmpty ? "" : (this.uniqueId.toString().substring(0, 6) + "..."));
    if (this.isActive)
      result += cocatinate("active");
    if (this.renderStyles.length > 0)
      result += cocatinate("renderStyles", this.renderStyles.length);
    return result;
  }

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

export function cocatinate(name: string, value?: any): string
{
  if (value === undefined || value === null)
    return ", " + name;
  return ", " + name + ": " + value;
}
