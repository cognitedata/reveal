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

import * as Color from "color"

import { UniqueId } from "@/Core/Primitives/UniqueId";
import { Identifiable } from "@/Core/Primitives/Identifiable";
import { TargetId } from "@/Core/Primitives/TargetId";
import { isInstanceOf, Class } from "@/Core/Primitives/ClassT";
import { RenderStyleResolution } from "@/Core/Enums/RenderStyleResolution";
import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";
import { ITargetIdAccessor } from "@/Core/Interfaces/ITargetIdAccessor";
import { BaseRenderStyle } from "@/Core/Styles/BaseRenderStyle";
import { ColorType } from "@/Core/Enums/ColorType";
import { Colors } from "@/Core/Primitives/Colors";
import { Changes } from "@/Core/Views/Changes";
import { CheckBoxState } from "@/Core/Enums/CheckBoxState";
import { ITarget } from "@/Core/Interfaces/ITarget";
import { Util } from "@/Core/Primitives/Util";
import { IEventListener } from "@/Core/Interfaces/IEventListener";
import { VirtualUserInterface } from "@/Core/States/VirtualUserInterface";
import { FileType } from "@/Core/Enums/FileType";
import { PropertyFolder } from "@/Core/Property/Concrete/Folder/PropertyFolder";

export abstract class BaseNode extends Identifiable
{
  //==================================================
  // STATIC FIELDS
  //==================================================

  static className = "BaseNode";

  //==================================================
  // CONSTRUCTORS
  //==================================================

  protected constructor() { super(); }

  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private _color: Color | undefined = undefined;
  private _name: string | undefined = undefined;
  private _isExpanded = false;

  private _isActive: boolean = false;
  private _isSelected: boolean = false;
  private _isInitialized: boolean = false;

  private _uniqueId: UniqueId = UniqueId.new();
  private _children: BaseNode[] = [];
  private _parent: BaseNode | null = null;
  private _renderStyles: BaseRenderStyle[] = [];

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get name(): string { return this.getName(); }
  public set name(value: string) { this.setName(value); }
  public get color(): Color { return this.getColor(); }
  public set color(value: Color) { this.setColor(value); }
  public get uniqueId(): UniqueId { return this._uniqueId; }
  public get renderStyles(): BaseRenderStyle[] { return this._renderStyles; }
  public get path(): string { return (this.parent ? this.parent.path : "") + "\\" + this.name; }
  public get isInitialized(): boolean { return this._isInitialized; }
  public get activeTarget(): ITarget | null { return this.activeTargetIdAccessor as ITarget; }

  public get displayName(): string // This is the text shown in the tree control
  {
    const nameExtension = this.getNameExtension();
    if (Util.isEmpty(nameExtension))
      return this.name;
    return `${this.name} [${nameExtension}]`;
  }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return BaseNode.className }
  public /*override*/ isA(className: string): boolean { return className === BaseNode.className || super.isA(className); }
  public /*override*/ toString(): string { return this.getDebugString(); }

  //==================================================
  // VIRTUAL METHODS: Name
  //==================================================

  public abstract get typeName(): string;
  public /*virtual*/ setName(value: string) { this._name = value; }
  public /*virtual*/ getName(): string { if (this._name === undefined) this._name = this.generateNewName(); return this._name; }
  public /*virtual*/ canChangeName(): boolean { return true; }
  public /*virtual*/ getNameExtension(): string | null { return null; }

  //==================================================
  // VIRTUAL METHODS: Label
  //==================================================

  public /*virtual*/ isVisibleInTreeControl(): boolean { return true; } // If false, the icon and it children is not shown in the tree control
  public /*virtual*/ getLabelColor(): Color { return Colors.black; }
  public /*virtual*/ isLabelInBold(): boolean { return this.isActive; } // true shows the label in bold font
  public /*virtual*/ isLabelInItalic(): boolean { return !this.canBeDeleted(); } // true shows the label in italic font

  //==================================================
  // VIRTUAL METHODS: Tabs
  //==================================================

  public /*virtual*/ get isTab(): boolean { return false; }

  //==================================================
  // VIRTUAL METHODS: Color
  //==================================================

  public /*virtual*/ getColor(): Color { if (this._color === undefined) this._color = this.generateNewColor(); return this._color; }
  public /*virtual*/ setColor(value: Color) { this._color = value; }
  public /*virtual*/ canChangeColor(): boolean { return true; }
  public /*virtual*/ hasIconColor(): boolean { return this.canChangeColor(); }

  //==================================================
  // VIRTUAL METHODS: Icon
  //==================================================

  public /*virtual*/ getIcon(): string { return (this.typeName + FileType.png); }

  //==================================================
  // VIRTUAL METHODS: Active / Selected
  //==================================================

  public /*virtual*/ get isActive(): boolean { return this._isActive; }
  public /*virtual*/ set isActive(value: boolean) { this._isActive = value; }
  public /*virtual*/ canBeActive(): boolean { return false; }
  public /*virtual*/ canBeSelected(): boolean { return true; }

  //==================================================
  // VIRTUAL METHODS: Appearance in the explorer
  //==================================================

  public /*virtual*/ canBeDeleted(): boolean { return true; }
  public /*virtual*/ canBeChecked(target: ITarget | null): boolean { return true; }
  public /*virtual*/ isFilter(target: ITarget | null): boolean { return false; }
  public /*virtual*/ isRadio(target: ITarget | null): boolean { return false; }

  //==================================================
  // VIRTUAL METHODS: Visibility
  //==================================================

  public /*virtual*/ getCheckBoxState(target?: ITarget | null): CheckBoxState
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
      return this.canBeChecked(target) ? CheckBoxState.None : CheckBoxState.Disabled;
    return CheckBoxState.Some;
  }

  public /*virtual*/ setVisibleInteractive(visible: boolean, target?: ITarget | null, topLevel = true): boolean
  {
    if (!target)
      target = this.activeTarget;
    if (!target)
      return false;
    const checkBoxState = this.getCheckBoxState(target);
    if (checkBoxState === CheckBoxState.Never)
      return false;
    if (checkBoxState === CheckBoxState.None && !this.canBeChecked(target))
      return false;

    let hasChanged = false;
    for (const child of this.children)
      if (child.setVisibleInteractive(visible, target, false))
        hasChanged = true;

    if (!hasChanged)
      return false;

    // Notify
    const args = new NodeEventArgs(Changes.visibleState);
    this.notify(args);
    if (topLevel)
    {
      for (const ancestor of this.getAncestorsExceptRoot())
        ancestor.notify(args);
    }
    return true;
  }

  public toggleVisibleInteractive(target?: ITarget | null): void // Use this when clicking on the checkbox in the three control
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
  protected /*virtual*/ get activeTargetIdAccessor(): ITargetIdAccessor | null
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
  public /*virtual*/ get renderStyleRoot(): BaseNode | null { return null; }
  public /*virtual*/ supportsColorType(colorType: ColorType): boolean { return true; }

  //==================================================
  // VIRTUAL METHODS: Populate Settings
  //==================================================

  protected /*virtual*/ populateInfoCore(folder: PropertyFolder): void
  {
    folder.addStringProperty("name", this.getName, !this.canChangeName(), this, this.nameChanged, this.setName);
    folder.addColorProperty("color", this.getColor, !this.canChangeColor(), this, this.colorChanged, this.setColor);
  }

  protected /*virtual*/ populateStatisticsCore(folder: PropertyFolder): void { }

  //==================================================
  // INSTANCE METHODS: Populate Settings
  //==================================================

  public nameChanged(): void { this.notify(new NodeEventArgs(Changes.nodeName)); }
  public colorChanged(): void { this.notify(new NodeEventArgs(Changes.nodeColor)); }

  public populateInfo(folder: PropertyFolder): void
  {
    this.populateInfoCore(folder);
  }

  public populateStatistics(folder: PropertyFolder): void
  {
    this.populateStatisticsCore(folder);
  }

  public populateRenderStyle(folder: PropertyFolder): void
  {
    var style = this.getRenderStyle();
    if (style)
      style.Populate(folder);
  }

  //==================================================
  // INSTANCE METHODS: Selected
  //==================================================

  public IsSelected(): boolean { return this._isSelected; }
  public SetSelected(value: boolean) { this._isSelected = value; }

  public SetSelectedInteractive(value: boolean)
  {
    if (this._isSelected === value)
      return false;

    if (!this.canBeExpanded)
      return false;

    this._isSelected = value;
    this.notify(new NodeEventArgs(Changes.selected));
    return true;
  }

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
      if (child.isVisibleInTreeControl())
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

  public getColorByColorType(colorType: ColorType): Color
  {
    switch (colorType)
    {
      case ColorType.Specified: return this.getColor();
      case ColorType.Parent: return this.parent ? this.parent.getColor() : Colors.grey;
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

  public *getChildrenByType<T extends BaseNode>(classType: Class<T>): Generator<T>
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

  public * getDescendants(): Generator<BaseNode>
  {
    for (const child of this.children)
    {
      yield child;
      for (const descendant of child.getDescendants())
        yield descendant;
    }
  }

  public * getThisAndDescendants(): Generator<BaseNode>
  {
    yield this;
    for (const descendant of this.getDescendants())
      yield descendant;
  }

  public * getDescendantsByType<T extends BaseNode>(classType: Class<T>): Generator<T>
  {
    for (const child of this.children)
    {
      if (isInstanceOf(child, classType))
        yield child as T;

      for (const descendant of child.getDescendantsByType<T>(classType))
      {
        if (isInstanceOf(descendant, classType))
          yield descendant as T;
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

  public * getThisAndAncestors(): Generator<BaseNode>
  {
    let ancestor: BaseNode | null = this;
    while (ancestor)
    {
      yield ancestor;
      ancestor = ancestor.parent;
    }
  }

  public * getAncestors(): Generator<BaseNode>
  {
    let ancestor = this.parent;
    while (ancestor)
    {
      yield ancestor;
      ancestor = ancestor.parent;
    }
  }

  public * getAncestorsExceptRoot(): Generator<BaseNode>
  {
    let ancestor = this.parent;
    while (ancestor && ancestor.hasParent)
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

  public addChild(child: BaseNode, insertFirst = false): void
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
    if (insertFirst)
      this._children.unshift(child);
    else
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

  public sortChildrenByName(): void
  {
    this.children.sort((a, b) => a.name.localeCompare(b.name));
  }

  //==================================================
  // INSTANCE METHODS: Misc
  //==================================================

  public notify(args: NodeEventArgs): void
  {
    for (const eventListener of this.eventListeners)
      eventListener.processEvent(this, args);

    VirtualUserInterface.updateNode(this, args);
    VirtualUserInterface.updateStatusPanel(JSON.stringify(args));
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
    this.eventListeners.length = 0;
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

    if (!this.canBeActive())
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
        if (!child.canBeActive())
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
  // INSTANCE METHODS: EventListener impementation
  //==================================================


  private eventListeners: IEventListener[] = [];

  public addEventListener(eventListener: IEventListener)
  {
    this.eventListeners.push(eventListener);
  }

  public removeEventListener(eventListener: IEventListener)
  {
    const index = this.eventListeners.indexOf(eventListener, 0);
    if (index < 0)
      return;

    this.eventListeners.splice(index, 1);
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

  protected generateNewColor(): Color
  {
    return this.canChangeColor() ? Colors.nextColor : Colors.white;
  }

  protected generateNewName(): string
  {
    let result = this.typeName;
    if (!this.canChangeName())
      return result;

    if (!this.parent)
      return result;

    let childIndex = 0;
    for (const child of this.parent.children)
    {
      if (child === this)
        break;
      if (this.typeName === child.typeName)
        childIndex++;
    }
    result += " " + (childIndex + 1);
    return result;
  }

  //==================================================
  // INSTANCE METHODS: Debugging
  //==================================================

  public /*virtual*/ getDebugString(): string
  {
    let result = this.name;
    result += Util.cocatinate("typeName", this.typeName);
    result += Util.cocatinate("className", this.className);
    if (this.canChangeColor())
      result += Util.cocatinate("color", this.getColor());
    result += Util.cocatinate("id", this.uniqueId.isEmpty ? "" : (this.uniqueId.toString().substring(0, 6) + "..."));
    if (this.isActive)
      result += Util.cocatinate("active");
    if (this.renderStyles.length > 0)
      result += Util.cocatinate("renderStyles", this.renderStyles.length);
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

