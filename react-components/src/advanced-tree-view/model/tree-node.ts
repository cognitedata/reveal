/*!
 * Copyright 2025 Cognite AS
 */
import { type Class, isInstanceOf } from '../utilities/class';

import { type ILazyLoader } from './i-lazy-loader';
import { type TreeNodeType } from './tree-node-type';
import { CheckboxState, type TreeNodeAction, type IconColor, type IconName } from './types';

/**
 * Represents a node in a tree structure.
 * This is the default Implements the TreeNodeType interface and can be reused
 * By default it is a simple tree node with a label.
 * in most cases.
 */
export class TreeNode implements TreeNodeType {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private _id?: string;
  private _label: string = '';
  private _icon: IconName = undefined;
  private _iconColor: string | undefined = undefined;
  private _isSelected: boolean = false;
  private _checkboxState: CheckboxState | undefined = undefined;
  private _isExpanded: boolean = false;
  private _isCheckboxEnabled: boolean = true;
  private _hasBoldLabel: boolean = false;
  private _hasInfoIcon: boolean = false; // AAA
  private _isLoadingChildren: boolean = false;
  private _isLoadingSiblings: boolean = false;
  private _needLoadChildren = false;
  private _needLoadSiblings = false;

  protected _children: TreeNode[] | undefined = undefined;
  protected _parent: TreeNode | undefined = undefined;

  // ==================================================
  // INSTANCE PROPERTIES (Some are implementation of TreeNodeType)
  // ==================================================

  public get id(): string {
    if (this._id === undefined) {
      this._id = TreeNode.generateId();
    }
    return this._id;
  }

  public get label(): string {
    return this._label;
  }

  public set label(value: string) {
    if (this._label !== value) {
      this._label = value;
      this.update();
    }
  }

  public get hasBoldLabel(): boolean {
    return this._hasBoldLabel;
  }

  public set hasBoldLabel(value: boolean) {
    if (this._hasBoldLabel !== value) {
      this._hasBoldLabel = value;
      this.update();
    }
  }

  public get icon(): IconName {
    return this._icon;
  }

  public set icon(value: IconName) {
    if (this._icon !== value) {
      this._icon = value;
      this.update();
    }
  }

  public get iconColor(): IconColor {
    return this._iconColor;
  }

  public set iconColor(value: IconColor) {
    if (this._iconColor !== value) {
      this._iconColor = value;
      this.update();
    }
  }

  public get hasInfoIcon(): boolean {
    // AAA
    return this._hasInfoIcon;
  }

  public set hasInfoIcon(value: boolean) {
    // AAA
    if (this._hasInfoIcon !== value) {
      this._hasInfoIcon = value;
      this.update();
    }
  }

  public get isSelected(): boolean {
    return this._isSelected;
  }

  public set isSelected(value: boolean) {
    if (this._isSelected !== value) {
      this._isSelected = value;
      this.update();
    }
  }

  public get isExpanded(): boolean {
    return this._isExpanded;
  }

  public set isExpanded(value: boolean) {
    if (this._isExpanded !== value) {
      this._isExpanded = value;
      this.update();
    }
  }

  public get isCheckboxEnabled(): boolean {
    return this._isCheckboxEnabled;
  }

  public set isCheckboxEnabled(value: boolean) {
    if (this._isCheckboxEnabled !== value) {
      this._isCheckboxEnabled = value;
      this.update();
    }
  }

  public get checkboxState(): CheckboxState | undefined {
    return this._checkboxState;
  }

  public set checkboxState(value: CheckboxState | undefined) {
    if (this._checkboxState !== value) {
      this._checkboxState = value;
      this.update();
    }
  }

  public get needLoadChildren(): boolean {
    return this._needLoadChildren;
  }

  public set needLoadChildren(value: boolean) {
    if (this._needLoadChildren !== value) {
      this._needLoadChildren = value;
      this.update();
    }
  }

  public get needLoadSiblings(): boolean {
    return this._needLoadSiblings;
  }

  public set needLoadSiblings(value: boolean) {
    if (this._needLoadSiblings !== value) {
      this._needLoadSiblings = value;
      this.update();
    }
  }

  public get isLoadingChildren(): boolean {
    return this._isLoadingChildren;
  }

  public set isLoadingChildren(value: boolean) {
    if (this._isLoadingChildren !== value) {
      this._isLoadingChildren = value;
      this.update();
    }
  }

  public get isLoadingSiblings(): boolean {
    return this._isLoadingSiblings;
  }

  public set isLoadingSiblings(value: boolean) {
    if (this._isLoadingSiblings !== value) {
      this._isLoadingSiblings = value;
      this.update();
    }
  }

  public get isParent(): boolean {
    if (this.needLoadChildren) {
      return true;
    }
    return this._children !== undefined && this._children.length > 0;
  }

  public get parent(): TreeNode | undefined {
    return this._parent;
  }

  public get children(): TreeNode[] | undefined {
    return this._children;
  }

  // ==================================================
  // VIRTUAL METHODS: To be overridden
  // ==================================================

  public areEqual(child: TreeNode): boolean {
    return this === child;
  }

  // ==================================================
  // INSTANCE METHODS: Getters
  // ==================================================

  // eslint-disable-next-line @typescript-eslint/prefer-return-this-type
  public getRoot(): TreeNode {
    if (this.parent !== undefined) {
      return this.parent.getRoot();
    }
    return this;
  }

  public getLastChild(): TreeNode | undefined {
    if (this._children === undefined) {
      return undefined;
    }
    return this._children[this._children.length - 1];
  }

  // ==================================================
  // INSTANCE METHODS: Selection and checked nodes
  // ==================================================

  public getSelectedNodes(): TreeNode[] {
    const nodes: TreeNode[] = [];
    for (const child of this.getThisAndDescendants()) {
      if (child.isSelected) {
        nodes.push(child);
      }
    }
    return nodes;
  }

  public getCheckedNodes(): TreeNode[] {
    const nodes: TreeNode[] = [];
    for (const child of this.getThisAndDescendants()) {
      if (child.checkboxState === CheckboxState.All) {
        nodes.push(child);
      }
    }
    return nodes;
  }

  public deselectAll(): void {
    for (const descendant of this.getThisAndDescendants()) {
      descendant.isSelected = false;
    }
  }

  public expandAllAncestors(): void {
    for (const ancestor of this.getAncestors()) {
      ancestor.isExpanded = true;
    }
  }

  // ==================================================
  // INSTANCE METHODS: Iterators
  // ==================================================

  public *getChildren(loader?: ILazyLoader): Generator<TreeNode> {
    if (this.isLoadingChildren) {
      loader = undefined;
    }
    const canLoad = this.isParent;
    if (canLoad && loader !== undefined && this.needLoadChildren) {
      void this.loadChildren(loader);
    }
    if (this._children === undefined) {
      return;
    }
    for (const child of this._children) {
      yield child;
    }
  }

  public *getChildrenByType<Type extends TreeNodeType>(classType: Class<Type>): Generator<Type> {
    for (const child of this.getChildren()) {
      if (isInstanceOf(child, classType)) {
        yield child;
      }
    }
  }

  public *getDescendants(): Generator<TreeNode> {
    for (const child of this.getChildren()) {
      yield child;
      yield* child.getDescendants();
    }
  }

  public *getExpandedDescendants(): Generator<TreeNode> {
    if (!this.isExpanded) {
      return;
    }
    for (const child of this.getChildren()) {
      yield child;
      yield* child.getDescendants();
    }
  }

  public *getDescendantsByType<Type extends TreeNodeType>(classType: Class<Type>): Generator<Type> {
    for (const descendant of this.getDescendants()) {
      if (isInstanceOf(descendant, classType)) {
        yield descendant;
      }
    }
  }

  public *getThisAndDescendants(): Generator<TreeNode> {
    yield this;
    for (const descendant of this.getDescendants()) {
      yield descendant;
    }
  }

  public *getThisAndDescendantsByType<Type extends TreeNodeType>(
    classType: Class<Type>
  ): Generator<Type> {
    for (const descendant of this.getThisAndDescendants()) {
      if (isInstanceOf(descendant, classType)) {
        yield descendant;
      }
    }
  }

  public *getAncestors(): Generator<TreeNode> {
    let ancestor = this.parent;
    while (ancestor !== undefined) {
      yield ancestor;
      ancestor = ancestor.parent;
    }
  }

  public *getAncestorsByType<Type extends TreeNodeType>(classType: Class<Type>): Generator<Type> {
    let ancestor = this.parent;
    while (ancestor !== undefined) {
      if (!isInstanceOf(ancestor, classType)) {
        break;
      }
      yield ancestor;
      ancestor = ancestor.parent;
    }
  }

  public *getThisAndAncestorsByType<Type extends TreeNodeType>(
    classType: Class<Type>
  ): Generator<Type> {
    if (!isInstanceOf(this, classType)) {
      return;
    }
    yield this;
    for (const ancestor of this.getAncestorsByType(classType)) {
      yield ancestor;
    }
  }

  // ==================================================
  // INSTANCE METHODS: Parent child relationship
  // ==================================================

  public addChild(child: TreeNode): void {
    if (this._children === undefined) {
      this._children = [];
    }
    this._children.push(child);
    child._parent = this;
    this.update();
  }

  public insertChild(index: number, child: TreeNode): void {
    if (this._children === undefined) {
      this._children = [];
    }
    insert(this._children, index, child);
    child._parent = this;
    this.update();
  }

  // ==================================================
  // INSTANCE METHODS: Loading
  // ==================================================

  private async loadChildren(loader: ILazyLoader): Promise<void> {
    this.isLoadingChildren = true;
    const children = await loader.loadChildren(this);
    this.isLoadingChildren = false;
    if (children === undefined || children.length === 0) {
      return;
    }
    if (this._children === undefined) {
      this._children = [];
    }
    if (children !== undefined) {
      for (const child of children) {
        if (!(child instanceof TreeNode)) {
          continue;
        }
        this.addChild(child);
        loader.onNodeLoaded?.(child, this);
      }
    }
    this.needLoadChildren = false;
  }

  public async loadSiblings(loader: ILazyLoader): Promise<void> {
    this.isLoadingSiblings = true;
    const siblings = await loader.loadSiblings(this);
    this.isLoadingSiblings = false;
    if (siblings === undefined || siblings.length === 0) {
      return;
    }
    const parent = this.parent;
    if (parent === undefined || parent._children === undefined) {
      return;
    }
    const children = parent._children;
    let index = children.indexOf(this);
    if (index === undefined || index < 0) {
      return;
    }
    for (const child of siblings) {
      if (!(child instanceof TreeNode)) {
        continue;
      }
      if (parent.hasChild(child)) {
        continue;
      }
      index++;
      parent.insertChild(index, child);
      loader.onNodeLoaded?.(child, parent);
    }
    this.needLoadSiblings = false;
    parent.update();
  }

  public hasChild(child: TreeNode): boolean {
    if (this._children === undefined) {
      return false;
    }
    return this._children.some((existingChild) => existingChild.areEqual(child));
  }

  // ==================================================
  // INSTANCE METHODS: Event listeners
  // ==================================================

  private readonly _listeners: TreeNodeAction[] = [];

  public addTreeNodeListener(listener: TreeNodeAction): void {
    this._listeners.push(listener);
  }

  public removeTreeNodeListener(listener: TreeNodeAction): void {
    remove(this._listeners, listener);
  }

  public update(): void {
    for (const listener of this._listeners) {
      listener(this);
    }
  }

  // ==================================================
  // STATIC METHODS:
  // ==================================================

  public static generateId(): string {
    return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString();
  }
}

function insert<T>(array: T[], index: number, element: T): void {
  array.splice(index, 0, element);
}

function removeAt<T>(array: T[], index: number): void {
  array.splice(index, 1);
}

function remove<T>(array: T[], element: T): boolean {
  // Return true if changed
  const index = array.indexOf(element);
  if (index < 0) {
    return false;
  }
  removeAt(array, index);
  return true;
}
