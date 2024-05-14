/*!
 * Copyright 2024 Cognite AS
 */
/* eslint-disable @typescript-eslint/class-literal-property-style */

import { type Color } from 'three';
import { type RenderStyle } from '../domainObjectsHelpers/RenderStyle';
import { DomainObjectChange } from '../domainObjectsHelpers/DomainObjectChange';
import { Changes } from '../domainObjectsHelpers/Changes';
import { isInstanceOf, type Class } from '../domainObjectsHelpers/Class';
import { equalsIgnoreCase, isEmpty } from '../utilities/extensions/stringExtensions';
import { VisibleState } from '../domainObjectsHelpers/VisibleState';
import { clear, removeAt } from '../utilities/extensions/arrayExtensions';
import { getNextColor } from '../utilities/colors/getNextColor';
import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';
import { ColorType } from '../domainObjectsHelpers/ColorType';
import { BLACK_COLOR, WHITE_COLOR } from '../utilities/colors/colorExtensions';
import { Subject } from './Subject';

/**
 * Represents an abstract base class for domain objects.
 * @abstract
 * @extends Subject
 */
export abstract class DomainObject extends Subject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private _name: string | undefined = undefined;
  private _color: Color | undefined = undefined;
  private _isSelected: boolean = false;
  private _isActive: boolean = false;
  private _isExpanded = false;
  private _isInitialized = false;

  private readonly _children: DomainObject[] = [];
  private _parent: DomainObject | undefined = undefined;
  private _renderStyle: RenderStyle | undefined = undefined;

  // ==================================================
  // INSTANCE/VIRTUAL PROPERTIES
  // ==================================================

  public abstract get typeName(): string; // to be overridden

  public get path(): string {
    return `${this.parent !== undefined ? this.parent.path : ''}\\${this.name}`;
  }

  public get displayName(): string {
    const nameExtension = this.nameExtension;
    if (isEmpty(nameExtension)) {
      return this.name;
    }
    return `${this.name} [${nameExtension}]`;
  }

  // ==================================================
  // VIRTUAL METHODS: Others
  // ==================================================

  /**
   * Initializes the core functionality of the domain object.
   * This method should be overridden in derived classes to provide custom implementation.
   * @param change - The change object representing the update.
   * @remarks
   * Always call `super.initializeCore()` in the overrides.
   */
  protected initializeCore(): void {}

  /**
   * Removes the core functionality of the domain object.
   * This method should be overridden in derived classes to provide custom implementation.
   * @remarks
   * Always call `super.removeCore()` in the overrides.
   */
  protected removeCore(): void {
    this.removeAllViews();
    this.removeEventListeners();
  }

  // ==================================================
  // INSTANCE/VIRTUAL METHODS: Nameing
  // ==================================================

  public get canChangeName(): boolean {
    return true; // to be overridden
  }

  public get name(): string {
    if (this._name === undefined || isEmpty(this._name)) {
      this._name = this.generateNewName();
    }
    return this._name;
  }

  public set name(value: string) {
    this._name = value;
  }

  public get nameExtension(): string | undefined {
    return undefined;
  }

  public hasEqualName(name: string): boolean {
    return equalsIgnoreCase(this.name, name);
  }

  // ==================================================
  // INSTANCE/VIRTUAL METHODS: Color
  // ==================================================

  public get canChangeColor(): boolean {
    return true; // to be overridden
  }

  public get hasIconColor(): boolean {
    return this.canChangeColor;
  }

  public get color(): Color {
    if (this._color === undefined) {
      this._color = this.generateNewColor();
    }
    return this._color;
  }

  public set color(value: Color) {
    this._color = value;
  }

  // ==================================================
  // INSTANCE/VIRTUAL METHODS: Selected
  // ==================================================

  public get canBeSelected(): boolean {
    return true; // to be overridden
  }

  public get isSelected(): boolean {
    return this._isSelected;
  }

  public set isSelected(value: boolean) {
    this._isSelected = value;
  }

  public setSelectedInteractive(value: boolean): boolean {
    if (this.isSelected === value) {
      return false;
    }
    this.isSelected = value;
    this.notify(Changes.selected);
    return true;
  }

  // ==================================================
  // INSTANCE/VIRTUAL METHODS: Active
  // ==================================================

  public get canBeActive(): boolean {
    return false; // to be overridden
  }

  public get isActive(): boolean {
    return this._isActive;
  }

  public set isActive(value: boolean) {
    this._isActive = value;
  }

  public setActiveInteractive(): void {
    // To be called when a object should be active
    if (this.isActive) {
      return;
    }
    if (!this.canBeActive) {
      return;
    }
    if (this.parent !== undefined) {
      // Turn the others off
      for (const sibling of this.parent.getDescendants()) {
        if (sibling === this) {
          continue;
        }
        if (sibling.typeName !== this.typeName) {
          continue;
        }
        if (!sibling.canBeActive) {
          continue;
        }
        if (!sibling.isActive) {
          continue;
        }
        sibling.isActive = false;
        sibling.notify(Changes.active);
      }
    }
    this.isActive = true;
    this.notify(Changes.active);
  }

  // ==================================================
  // INSTANCE/INSTANCE METHODS: Expanded
  // ==================================================

  public get canBeExpanded(): boolean {
    return this.childCount > 0; // to be overridden
  }

  public get isExpanded(): boolean {
    return this._isExpanded;
  }

  public set isExpanded(value: boolean) {
    this._isExpanded = value;
  }

  public setExpandedInteractive(value: boolean): boolean {
    if (this.isExpanded === value) {
      return false;
    }
    this.isExpanded = value;
    this.notify(Changes.expanded);
    return true;
  }

  // ==================================================
  // VIRTUAL METHODS: Appearance in the explorer
  // ==================================================

  public get canBeDeleted(): boolean {
    return true; // to be overridden
  }

  public canBeChecked(_target: RevealRenderTarget): boolean {
    return true; // to be overridden
  }

  // ==================================================
  // VIRTUAL METHODS: Visibility
  // ==================================================

  public getVisibleState(target: RevealRenderTarget): VisibleState {
    let numCandidates = 0;
    let numAll = 0;
    let numNone = 0;

    for (const child of this.children) {
      const childState = child.getVisibleState(target);
      if (childState === VisibleState.Disabled) {
        continue;
      }
      numCandidates++;
      if (childState === VisibleState.All) {
        numAll++;
      } else if (childState === VisibleState.None || childState === VisibleState.CanNotBeChecked) {
        numNone++;
      }
      if (numNone < numCandidates && numCandidates < numAll) {
        return VisibleState.Some;
      }
    }
    if (numCandidates === 0) {
      return VisibleState.Disabled;
    }
    if (numCandidates === numAll) {
      return VisibleState.All;
    }
    if (numCandidates === numNone) {
      return this.canBeChecked(target) ? VisibleState.None : VisibleState.CanNotBeChecked;
    }
    return VisibleState.Some;
  }

  public setVisibleInteractive(
    visible: boolean,
    target: RevealRenderTarget,
    topLevel = true // When calling this from outside, this value should alwaus be true
  ): boolean {
    const visibleState = this.getVisibleState(target);
    if (visibleState === VisibleState.Disabled) {
      return false;
    }
    if (visibleState === VisibleState.None && !this.canBeChecked(target)) {
      return false;
    }
    let hasChanged = false;
    for (const child of this.children) {
      if (child.setVisibleInteractive(visible, target, false)) {
        hasChanged = true;
      }
    }
    if (!hasChanged) {
      return false;
    }
    if (topLevel) {
      this.notifyVisibleStateChange();
    }
    return true;
  }

  protected notifyVisibleStateChange(): void {
    const change = new DomainObjectChange(Changes.visibleState);
    this.notify(change);
    for (const ancestor of this.getAncestors()) {
      ancestor.notify(change);
    }
    for (const descendant of this.getDescendants()) {
      descendant.notify(change);
    }
  }

  public toggleVisibleInteractive(target: RevealRenderTarget): void {
    const visibleState = this.getVisibleState(target);
    if (visibleState === VisibleState.None) this.setVisibleInteractive(true, target);
    else if (visibleState === VisibleState.Some || visibleState === VisibleState.All)
      this.setVisibleInteractive(false, target);
  }

  // ==================================================
  // VIRTUAL METHODS: Render styles
  // ==================================================

  public get renderStyleRoot(): DomainObject | undefined {
    return undefined; // Override if the render style is taken from another domain object
  }

  public createRenderStyle(): RenderStyle | undefined {
    return undefined; // Override when creating a render style
  }

  public verifyRenderStyle(_style: RenderStyle): void {
    // override when validating the render style
  }

  // ==================================================
  // INSTANCE PROPERTIES: Child-Parent relationship
  // ==================================================

  public get children(): DomainObject[] {
    return this._children;
  }

  public get childCount(): number {
    return this._children.length;
  }

  public get childIndex(): number | undefined {
    return this.parent === undefined ? undefined : this.parent.children.indexOf(this);
  }

  public get parent(): DomainObject | undefined {
    return this._parent;
  }

  public get root(): DomainObject {
    return this.parent === undefined ? this : this.parent.root;
  }

  public get hasParent(): boolean {
    return this._parent !== undefined;
  }

  // ==================================================
  // INSTANCE METHODS: Get a child or children
  // ==================================================

  public hasChildByType<T extends DomainObject>(classType: Class<T>): boolean {
    return this.getChildByType(classType) !== undefined;
  }

  public getChild(index: number): DomainObject {
    return this._children[index];
  }

  public getChildByName(name: string): DomainObject | undefined {
    for (const child of this.children) {
      if (child.hasEqualName(name)) {
        return child;
      }
    }
    return undefined;
  }

  public getChildByType<T extends DomainObject>(classType: Class<T>): T | undefined {
    for (const child of this.children) {
      if (isInstanceOf(child, classType)) {
        return child;
      }
    }
    return undefined;
  }

  public getActiveChildByType<T extends DomainObject>(classType: Class<T>): T | undefined {
    for (const child of this.children) {
      if (child.isActive && isInstanceOf(child, classType)) {
        return child;
      }
    }
    return undefined;
  }

  public *getChildrenByType<T extends DomainObject>(classType: Class<T>): Generator<T> {
    for (const child of this.children) {
      if (isInstanceOf(child, classType)) {
        yield child;
      }
    }
  }

  // ==================================================
  // INSTANCE METHODS: Get descendants
  // ==================================================

  public getSelected(): DomainObject | undefined {
    for (const descendant of this.getThisAndDescendants()) {
      if (descendant.isSelected) {
        return descendant;
      }
    }
    return undefined;
  }

  public *getDescendants(): Generator<DomainObject> {
    for (const child of this.children) {
      yield child;
      for (const descendant of child.getDescendants()) {
        yield descendant;
      }
    }
  }

  public *getThisAndDescendants(): Generator<DomainObject> {
    yield this;
    for (const descendant of this.getDescendants()) {
      yield descendant;
    }
  }

  public getDescendantByName(name: string): DomainObject | undefined {
    for (const descendant of this.getDescendants()) {
      if (descendant.hasEqualName(name)) {
        return descendant;
      }
    }
    return undefined;
  }

  public getDescendantByTypeAndName<T extends DomainObject>(
    classType: Class<T>,
    name: string
  ): T | undefined {
    for (const descendant of this.getDescendants()) {
      if (isInstanceOf(descendant, classType) && descendant.hasEqualName(name)) {
        return descendant;
      }
    }
    return undefined;
  }

  public getDescendantByType<T extends DomainObject>(classType: Class<T>): T | undefined {
    for (const descendant of this.getDescendants()) {
      if (isInstanceOf(descendant, classType)) {
        return descendant;
      }
    }
    return undefined;
  }

  public *getDescendantsByType<T extends DomainObject>(classType: Class<T>): Generator<T> {
    for (const child of this.children) {
      if (isInstanceOf(child, classType)) {
        yield child;
      }
      for (const descendant of child.getDescendantsByType<T>(classType)) {
        if (isInstanceOf(descendant, classType)) {
          yield descendant;
        }
      }
    }
  }

  public getActiveDescendantByType<T extends DomainObject>(classType: Class<T>): T | undefined {
    for (const child of this.children) {
      if (child.isActive && isInstanceOf(child, classType)) {
        return child;
      }
      const descendant = child.getActiveDescendantByType(classType);
      if (descendant !== undefined) {
        return descendant;
      }
    }
    return undefined;
  }

  // ==================================================
  // INSTANCE METHODS: Get ancestors
  // ==================================================

  public *getThisAndAncestors(): Generator<DomainObject> {
    yield this;
    let ancestor = this.parent;
    while (ancestor !== undefined) {
      yield ancestor;
      ancestor = ancestor.parent;
    }
  }

  public *getAncestors(): Generator<DomainObject> {
    let ancestor = this.parent;
    while (ancestor !== undefined) {
      yield ancestor;
      ancestor = ancestor.parent;
    }
  }

  public getAncestorByType<T>(classType: Class<T>): T | undefined {
    for (const ancestor of this.getAncestors()) {
      if (isInstanceOf(ancestor, classType)) {
        return ancestor as T;
      }
    }
    return undefined;
  }

  public getThisOrAncestorByType<T>(classType: Class<T>): T | undefined {
    for (const ancestor of this.getThisAndAncestors()) {
      if (isInstanceOf(ancestor, classType)) {
        return ancestor as T;
      }
    }
    return undefined;
  }

  // ==================================================
  // INSTANCE METHODS: Child-Parent relationship
  // ==================================================

  public addChild(child: DomainObject, insertFirst = false): void {
    if (child.hasParent) {
      throw Error(`The child ${child.typeName} already has a parent`);
    }
    if (child === this) {
      throw Error(`Trying to add illegal child ${child.typeName}`);
    }
    if (insertFirst) {
      this._children.unshift(child);
    } else {
      this._children.push(child);
    }
    child._parent = this;
  }

  public addChildInteractive(child: DomainObject, insertFirst = false): void {
    this.addChild(child, insertFirst);
    this.notify(Changes.childAdded);
  }

  private remove(): boolean {
    const { childIndex } = this;
    if (childIndex === undefined) {
      throw Error(`The child ${this.typeName} is not child of it's parent`);
    }
    clear(this._children);
    this.removeCore();

    if (this.parent !== undefined) {
      removeAt(this.parent.children, childIndex);
      this._parent = undefined;
    }
    return true;
  }

  public removeInteractive(): void {
    for (const child of this.children) {
      child.removeInteractive();
    }
    const { parent } = this;
    this.remove();
    parent?.notify(Changes.childDeleted);
  }

  public sortChildrenByName(): void {
    this.children.sort((a, b) => a.name.localeCompare(b.name));
  }

  // ==================================================
  // INSTANCE METHODS: Initialization
  // ==================================================

  public initialize(): void {
    if (this._isInitialized) {
      return; // This should be done once
    }
    this.initializeCore();
    this._isInitialized = true;
  }

  public initializeRecursive(): void {
    this.initialize();
    for (const child of this.children) {
      child.initializeRecursive();
    }
  }

  // ==================================================
  // INSTANCE METHODS: Render styles
  // ==================================================

  public getRenderStyle(): RenderStyle | undefined {
    const root = this.renderStyleRoot;
    if (root !== undefined && root !== this) {
      return root.getRenderStyle();
    }
    if (this._renderStyle === undefined) {
      this._renderStyle = this.createRenderStyle();
    }
    if (this._renderStyle !== undefined) {
      this.verifyRenderStyle(this._renderStyle);
    }
    return this._renderStyle;
  }

  public setRenderStyle(value: RenderStyle | undefined = undefined): void {
    this._renderStyle = value;
  }

  // ==================================================
  // INSTANCE METHODS: Get auto name and color
  // ==================================================

  protected generateNewColor(): Color {
    return this.canChangeColor ? getNextColor().clone() : WHITE_COLOR.clone();
  }

  protected generateNewName(): string {
    let result = this.typeName;
    if (!this.canChangeName) {
      return result;
    }
    if (this.parent === undefined) {
      return result;
    }
    let childIndex = 0;
    for (const child of this.parent.children) {
      if (child === this) {
        break;
      }
      if (this.typeName === child.typeName) {
        childIndex += 1;
      }
    }
    result += ` ${childIndex + 1}`;
    return result;
  }

  public supportsColorType(colorType: ColorType, solid: boolean): boolean {
    switch (colorType) {
      case ColorType.Specified:
      case ColorType.Parent:
      case ColorType.Black:
      case ColorType.White:
        return true;

      case ColorType.ColorMap:
        return solid;

      default:
        return false;
    }
  }

  public getColorByColorType(colorType: ColorType): Color {
    switch (colorType) {
      case ColorType.Specified:
        return this.color;
      case ColorType.Parent:
        if (this.parent !== undefined) {
          return this.parent.color;
        }
        break;
      case ColorType.Black:
        return BLACK_COLOR;
    }
    return WHITE_COLOR;
  }
}
