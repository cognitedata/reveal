/*!
 * Copyright 2024 Cognite AS
 */

import { type Color } from 'three';
import { BLACK_COLOR, WHITE_COLOR } from '../utilities/colors/colorExtensions';
import { type RenderStyle } from '../renderStyles/RenderStyle';
import { DomainObjectChange } from '../domainObjectsHelpers/DomainObjectChange';
import { Changes } from '../domainObjectsHelpers/Changes';
import { isInstanceOf, type Class } from '../domainObjectsHelpers/Class';
import { equalsIgnoreCase, isEmpty } from '../utilities/extensions/stringExtensions';
import { VisibleState } from '../domainObjectsHelpers/VisibleState';
import { clear, removeAt } from '../utilities/extensions/arrayExtensions';
import { getNextColor } from '../utilities/colors/getNextColor';
import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';
import { ColorType } from '../domainObjectsHelpers/ColorType';
import { Views } from '../domainObjectsHelpers/Views';
import { type PanelInfo } from '../domainObjectsHelpers/PanelInfo';
import { PopupStyle } from '../domainObjectsHelpers/PopupStyle';
import { RootDomainObject } from './RootDomainObject';
import { CommandsUpdater } from '../reactUpdaters/CommandsUpdater';
import { DomainObjectPanelUpdater } from '../reactUpdaters/DomainObjectPanelUpdater';
import { isTranslatedString, type TranslationInput } from '../utilities/TranslateInput';
import { DeleteDomainObjectCommand } from '../concreteCommands/DeleteDomainObjectCommand';
import { CopyToClipboardCommand } from '../concreteCommands/CopyToClipboardCommand';
import { type BaseCommand } from '../commands/BaseCommand';
import { type Transaction } from '../undo/Transaction';
import { type IconName } from '../../base/utilities/IconName';
import { ToggleMetricUnitsCommand } from '../concreteCommands/ToggleMetricUnitsCommand';
import { ChangedDescription } from '../domainObjectsHelpers/ChangedDescription';

/**
 * Represents an abstract base class for domain objects.
 * @abstract
 */
export abstract class DomainObject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  // Some basic states
  private _name: string | undefined = undefined;
  private _color: Color | undefined = undefined;

  // Selection. This is used for selection in 3D viewer. Selection in a tree view is
  // not implemented yet, but should be added in the future.
  private _isSelected: boolean = false;

  // Maximum one active object for each type of domain object. Works as a long term selection
  // For instance you can have many crop boxes, but only one can be used at the time.
  private _isActive: boolean = false;

  // Expand when it is shown in a tree view
  private _isExpanded = false;

  // Parent-Child relationship
  private readonly _children: DomainObject[] = [];
  private _parent: DomainObject | undefined = undefined;

  // Render style
  private _renderStyle: RenderStyle | undefined = undefined;

  // Views and listeners
  public readonly views: Views = new Views();

  // Unique index for the domain object, used as soft reference
  private _uniqueId: number;
  private static _counter: number = 0; // Counter for the unique index

  public get uniqueId(): number {
    return this._uniqueId;
  }

  public set uniqueId(value: number) {
    this._uniqueId = value;
  }

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor() {
    DomainObject._counter++;
    this._uniqueId = DomainObject._counter;
  }

  // ==================================================
  // INSTANCE/VIRTUAL PROPERTIES
  // ==================================================

  public abstract get typeName(): TranslationInput; // to be overridden

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
  // INSTANCE/VIRTUAL METHODS: Naming
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
    return undefined; // to be overridden, should be added to the name in UI for more information
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
  // INSTANCE/INSTANCE METHODS: Expanded in tree view
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
  // VIRTUAL METHODS: Appearance in the tree view
  // ==================================================

  public get canBeRemoved(): boolean {
    return true; // to be overridden
  }

  public canBeSetVisibleNow(_target: RevealRenderTarget): boolean {
    return true; // to be overridden
  }

  /**
   * Gets a value indicating whether the domain object is legal.
   * Normally it is legal, but if the object is pending when creating it, it is not legal.
   * @returns {boolean} A boolean value indicating whether the domain object is legal.
   */

  public get isLegal(): boolean {
    return true;
  }

  // ==================================================
  // VIRTUAL METHODS: Notification
  // ==================================================

  /**
   * Notifies the registered views and listeners about a change in the domain object.
   * This method should be overridden in derived classes to provide custom implementation.
   * @param change - The change object representing the update.
   * @remarks
   * Always call `super.notifyCore()` in the overrides.
   */
  protected notifyCore(change: DomainObjectChange): void {
    this.views.notify(this, change);

    // If isRenderStyleRoot is true, notify all descendants
    if (change.isChanged(Changes.renderStyle) && this.isRenderStyleRoot) {
      const description = change.getChangedDescription(Changes.renderStyle);
      if (description !== undefined) {
        const renderStyleChange = new DomainObjectChange(description);
        this.notifyDescendants(renderStyleChange);
      }
    }

    if (
      change.isChanged(
        Changes.visibleState,
        Changes.active,
        Changes.selected,
        Changes.childAdded,
        Changes.childDeleted
      )
    ) {
      if (this.root instanceof RootDomainObject) {
        // Update all the command buttons (in the toolbars).
        // This goes fast and will not slow the system down.
        CommandsUpdater.update(this.root.renderTarget);
      }
    }
    if (this.hasPanelInfo) {
      // Update the DomainObjectPanel if any
      DomainObjectPanelUpdater.notify(this, change);
    }
  }

  /**
   * Creates a transaction based on the specified changes. This is used for undoing
   * @param changed - A symbol representing the changes made to the domain object.
   * @returns A Transaction object if the transaction was created successfully, otherwise undefined.
   */
  public createTransaction(_changed: symbol): Transaction | undefined {
    return undefined;
  }

  /**
   * Creates a copy of this the domain object. The copy will not include any parent/child relationships, or views
   * @param what - Optional parameter specifying which properties to copy. If not provided, all properties will be copied.
   * @returns A new domain object
   */
  public clone(_what?: symbol): DomainObject {
    throw new Error('Method not implemented.');
  }

  /**
   * Copies the properties from another `DomainObject` instance to this instance.
   * @param domainObject - The `DomainObject` instance to copy from.
   * @param what - Optional parameter specifying which properties to copy. If not provided, all properties will be copied.
   */
  public copyFrom(domainObject: DomainObject, what?: symbol): void {
    if (what === undefined) {
      this.uniqueId = domainObject.uniqueId;
    }
    if (what === undefined || what === Changes.color) {
      this.color = domainObject.color;
    }
    if (what === undefined || what === Changes.naming) {
      this.name = domainObject.name;
    }
    if (what === undefined || what === Changes.renderStyle) {
      this._renderStyle = domainObject._renderStyle?.clone();
    }
  }

  // ==================================================
  // VIRTUAL METHODS: For updating the panel
  // ==================================================

  public get hasPanelInfo(): boolean {
    return false; // to be overridden
  }

  public getPanelInfo(): PanelInfo | undefined {
    return undefined; // to be overridden
  }

  public getPanelInfoStyle(): PopupStyle {
    // Default lower left corner
    return new PopupStyle({ bottom: 50, left: 0 });
  }

  public getPanelToolbar(): BaseCommand[] {
    // to be overridden
    return [
      new CopyToClipboardCommand(),
      new ToggleMetricUnitsCommand(),
      new DeleteDomainObjectCommand(this)
    ];
  }

  // ==================================================
  // VIRTUAL METHODS: Others
  // ==================================================

  public get icon(): IconName {
    return undefined;
  }

  /**
   * Removes the core functionality of the domain object.
   * This method should be overridden in derived classes to provide custom implementation.
   * @remarks
   * Always call `super.removeCore()` in the overrides.
   */
  protected removeCore(): void {
    this.views.clear();
  }

  // ==================================================
  // VIRTUAL METHODS: Render styles
  // ==================================================

  /**
   * Override if the render style is taken from another domain object, for instance the parent
   * or somewhere else in the hierarchy
   * @returns The render style root
   */
  public get renderStyleRoot(): DomainObject | undefined {
    return undefined;
  }

  /**
   * Override if this domain object is a render style root, se method above
   * @returns true if this is a render style root
   */
  public get isRenderStyleRoot(): boolean {
    return false;
  }

  /**
   * Factory method to create the render style for the domain object.
   * Override this method to create a custom render style.
   * @returns The render style
   */
  public createRenderStyle(): RenderStyle | undefined {
    return undefined;
  }

  /**
   * Verifies the render style for the domain object, because the render style may
   * be not valid in some cases. In this method you can change the render style.
   * You can also change som fields in the renderStyle to get default values
   * dependent of the domain object itself.
   * Override this method when needed
   */
  public verifyRenderStyle(_style: RenderStyle): void {}

  // ==================================================
  // VIRTUAL METHODS: Visibility
  // ==================================================

  public getVisibleState(renderTarget: RevealRenderTarget): VisibleState {
    let numCandidates = 0;
    let numAll = 0;
    let numNone = 0;

    for (const child of this.children) {
      const childState = child.getVisibleState(renderTarget);
      if (childState === VisibleState.Disabled) {
        continue;
      }
      numCandidates++;
      if (childState === VisibleState.All) {
        numAll++;
      } else if (
        childState === VisibleState.None ||
        childState === VisibleState.CanNotBeVisibleNow
      ) {
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
      return this.canBeSetVisibleNow(renderTarget)
        ? VisibleState.None
        : VisibleState.CanNotBeVisibleNow;
    }
    return VisibleState.Some;
  }

  public setVisibleInteractive(
    visible: boolean,
    renderTarget: RevealRenderTarget | undefined = undefined,
    topLevel = true // When calling this from outside, this value should always be true
  ): boolean {
    if (renderTarget === undefined) {
      renderTarget = this.rootDomainObject?.renderTarget;
      if (renderTarget === undefined) {
        return false;
      }
    }
    const visibleState = this.getVisibleState(renderTarget);
    if (visibleState === VisibleState.Disabled) {
      return false;
    }
    if (visibleState === VisibleState.None && !this.canBeSetVisibleNow(renderTarget)) {
      return false;
    }
    let hasChanged = false;
    for (const child of this.children) {
      if (child.setVisibleInteractive(visible, renderTarget, false)) {
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

  // ==================================================
  // INSTANCE METHODS: Notification
  // ==================================================

  public notify(change: DomainObjectChange | ChangedDescription | symbol): void {
    if (typeof change === 'symbol') {
      change = new DomainObjectChange(change);
    } else if (change instanceof ChangedDescription) {
      change = new DomainObjectChange(change);
    }
    this.notifyCore(change);
  }

  public notifyDescendants(change: DomainObjectChange | symbol): void {
    if (typeof change === 'symbol') {
      change = new DomainObjectChange(change);
    } else if (change instanceof ChangedDescription) {
      change = new DomainObjectChange(change);
    }
    for (const descendant of this.getDescendants()) {
      descendant.notify(change);
    }
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
  // ==================================================
  // INSTANCE METHODS: Visibility
  // ==================================================

  public toggleVisibleInteractive(renderTarget: RevealRenderTarget): void {
    const visibleState = this.getVisibleState(renderTarget);
    if (visibleState === VisibleState.None) {
      this.setVisibleInteractive(true, renderTarget);
    } else if (visibleState === VisibleState.Some || visibleState === VisibleState.All) {
      this.setVisibleInteractive(false, renderTarget);
    }
  }

  /**
   * Checks if the domain object is visible in the specified render target.
   * @param renderTarget - The render target to check visibility in.
   * @returns `true` if the domain object is visible in the target, `false` otherwise.
   */
  public isVisible(renderTarget: RevealRenderTarget): boolean {
    const visibleState = this.getVisibleState(renderTarget);
    return visibleState === VisibleState.Some || visibleState === VisibleState.All;
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
    // Returns the root of the hierarchy, regardless what it is
    return this.parent === undefined ? this : this.parent.root;
  }

  public get rootDomainObject(): RootDomainObject | undefined {
    // Returns a RootDomainObject only if the root is a RootDomainObject, otherwise undefined
    const root = this.root;
    return root instanceof RootDomainObject ? root : undefined;
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
  // INSTANCE METHODS: Get descendants (returning a generator)
  // ==================================================

  public *getDescendants(): Generator<DomainObject> {
    for (const child of this.children) {
      yield child;
      yield* child.getDescendants();
    }
  }

  public *getThisAndDescendants(): Generator<DomainObject> {
    yield this;
    for (const descendant of this.getDescendants()) {
      yield descendant;
    }
  }

  public *getDescendantsByType<T extends DomainObject>(classType: Class<T>): Generator<T> {
    for (const descendant of this.getDescendants()) {
      if (isInstanceOf(descendant, classType)) {
        yield descendant;
      }
    }
  }

  public *getThisAndDescendantsByType<T extends DomainObject>(classType: Class<T>): Generator<T> {
    for (const descendant of this.getThisAndDescendants()) {
      if (isInstanceOf(descendant, classType)) {
        yield descendant;
      }
    }
  }

  // ==================================================
  // INSTANCE METHODS: Get single descendant
  // (returning a DomainObject | undefined)
  // ==================================================

  public getDescendantByType<T extends DomainObject>(classType: Class<T>): T | undefined {
    for (const descendant of this.getDescendants()) {
      if (isInstanceOf(descendant, classType)) {
        return descendant;
      }
    }
    return undefined;
  }

  public getDescendantByName(name: string): DomainObject | undefined {
    for (const descendant of this.getDescendants()) {
      if (descendant.hasEqualName(name)) {
        return descendant;
      }
    }
    return undefined;
  }

  public getThisOrDescendantByUniqueId(uniqueId: number): DomainObject | undefined {
    for (const descendant of this.getThisAndDescendants()) {
      if (descendant.uniqueId === uniqueId) {
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

  public getSelectedDescendant(): DomainObject | undefined {
    for (const descendant of this.getThisAndDescendants()) {
      if (descendant.isSelected) {
        return descendant;
      }
    }
    return undefined;
  }

  public getSelectedDescendantByType<T extends DomainObject>(classType: Class<T>): T | undefined {
    for (const descendant of this.getDescendantsByType(classType)) {
      if (descendant.isSelected) {
        return descendant;
      }
    }
    return undefined;
  }

  public getActiveDescendantByType<T extends DomainObject>(classType: Class<T>): T | undefined {
    for (const descendant of this.getDescendantsByType(classType)) {
      if (descendant.isActive) {
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
      throw Error(`The child ${child.getTypeName()} already has a parent`);
    }
    if (child === this) {
      throw Error(`Trying to add illegal child ${child.getTypeName()}`);
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
    child.notify(Changes.added);
  }

  private remove(): boolean {
    const { childIndex } = this;
    if (childIndex === undefined) {
      throw Error(`The child ${this.getTypeName()} is not child of it's parent`);
    }
    clear(this._children);
    this.removeCore();

    if (this.parent !== undefined) {
      removeAt(this.parent.children, childIndex);
      this._parent = undefined;
    }
    return true;
  }

  public removeInteractive(checkCanBeDeleted = true): boolean {
    if (checkCanBeDeleted && !this.canBeRemoved) {
      return false;
    }
    for (const child of this.children) {
      child.removeInteractive(false); // If parent can be removed, so the children also
    }
    const { parent } = this;
    this.notify(Changes.deleted);
    this.remove();
    parent?.notify(Changes.childDeleted);
    return true;
  }

  public sortChildrenByName(): void {
    this.children.sort((a, b) => a.name.localeCompare(b.name));
  }

  // ==================================================
  // INSTANCE METHODS: Render styles
  // ==================================================

  public getRenderStyle(): RenderStyle | undefined {
    // Find the root of the render style
    const root = this.renderStyleRoot;
    if (root !== undefined && root !== this) {
      return root.getRenderStyle();
    }
    // Create it if not created
    if (this._renderStyle === undefined) {
      this._renderStyle = this.createRenderStyle();
    }
    // Verify it
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

  private generateNewColor(): Color {
    return this.canChangeColor ? getNextColor().clone() : WHITE_COLOR.clone();
  }

  private generateNewName(): string {
    let result = this.getTypeName();
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

  private getTypeName(): string {
    if (isTranslatedString(this.typeName)) {
      return this.typeName.key;
    } else {
      return this.typeName.untranslated;
    }
  }

  // ==================================================
  // INSTANCE METHODS: Color type
  // Used in the render style to determine which of the color a domain object should have.
  // ==================================================

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
