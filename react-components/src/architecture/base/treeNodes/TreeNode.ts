/*!
 * Copyright 2024 Cognite AS
 */

import { type Class, isInstanceOf } from '../domainObjectsHelpers/Class';
import { insert, remove } from '../utilities/extensions/arrayExtensions';
import { type IconName } from '../utilities/IconName';
import { type ITreeNode } from './ITreeNode';
import { CheckBoxState, type TreeNodeAction, type IconColor, type LoadNodesAction } from './types';

export class TreeNode<T = any> implements ITreeNode {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private _label: string = '';
  private _icon: IconName = undefined;
  private _iconColor: string | undefined = undefined;
  private _isSelected: boolean = false;
  private _checkBoxState: CheckBoxState = CheckBoxState.Hidden;
  private _isExpanded: boolean = false;
  private _isEnabled: boolean = true;
  private _hasBoldLabel: boolean = false;
  private _isLoadingChildren: boolean = false;
  private _isLoadingSiblings: boolean = false;
  private _needLoadChildren = false;
  private _needLoadSiblings = false;
  public userData: T | undefined = undefined;

  protected _children: Array<TreeNode<T>> | undefined = undefined;
  protected _parent: TreeNode<T> | undefined = undefined;

  // ==================================================
  // INSTANCE PROPERTIES (Some are implementation of ITreeNode<T>)
  // ==================================================

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

  public get isSelected(): boolean {
    return this._isSelected;
  }

  public set isSelected(value: boolean) {
    if (this._isSelected !== value) {
      this._isSelected = value;
      this.update();
    }
  }

  public get isEnabled(): boolean {
    return this._isEnabled;
  }

  public set isEnabled(value: boolean) {
    if (this._isEnabled !== value) {
      this._isEnabled = value;
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

  public get checkBoxState(): CheckBoxState {
    return this._checkBoxState;
  }

  public set checkBoxState(value: CheckBoxState) {
    if (this._checkBoxState !== value) {
      this._checkBoxState = value;
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

  public get parent(): TreeNode<T> | undefined {
    return this._parent;
  }

  public get children(): Array<TreeNode<T>> | undefined {
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
  public getRoot(): TreeNode<T> {
    if (this.parent !== undefined) {
      return this.parent.getRoot();
    }
    return this;
  }

  public getLastChild(): TreeNode<T> | undefined {
    if (this._children === undefined) {
      return undefined;
    }
    return this._children[this._children.length - 1];
  }

  // ==================================================
  // INSTANCE METHODS: Selection and checked nodes
  // ==================================================

  public getSelectedNodes(): Array<TreeNode<T>> {
    const nodes: Array<TreeNode<T>> = [];
    for (const child of this.getThisAndDescendants()) {
      if (child.isSelected) {
        nodes.push(child);
      }
    }
    return nodes;
  }

  public getCheckedNodes(): Array<TreeNode<T>> {
    const nodes: Array<TreeNode<T>> = [];
    for (const child of this.getThisAndDescendants()) {
      if (child.checkBoxState === CheckBoxState.All) {
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

  public *getChildren(loadNodes?: LoadNodesAction): Generator<TreeNode<T>> {
    if (this.isLoadingChildren) {
      loadNodes = undefined;
    }
    const canLoad = this.isParent && this.parent !== undefined;
    if (canLoad && loadNodes !== undefined && this.needLoadChildren) {
      void this.loadChildren(loadNodes);
    }
    if (this._children === undefined) {
      return;
    }
    for (const child of this._children) {
      yield child;
    }
  }

  public *getChildrenByType<Type extends ITreeNode>(
    classType: Class<Type>,
    loadNodes?: LoadNodesAction
  ): Generator<Type> {
    for (const child of this.getChildren(loadNodes)) {
      if (isInstanceOf(child, classType)) {
        yield child;
      }
    }
  }

  public *getDescendants(): Generator<TreeNode<T>> {
    for (const child of this.getChildren()) {
      yield child;
      yield* child.getDescendants();
    }
  }

  public *getExpandedDescendants(): Generator<TreeNode<T>> {
    if (!this.isExpanded) {
      return;
    }
    for (const child of this.getChildren()) {
      yield child;
      yield* child.getDescendants();
    }
  }

  public *getDescendantsByType<Type extends ITreeNode>(classType: Class<Type>): Generator<Type> {
    for (const descendant of this.getDescendants()) {
      if (isInstanceOf(descendant, classType)) {
        yield descendant;
      }
    }
  }

  public *getThisAndDescendants(): Generator<TreeNode<T>> {
    yield this;
    for (const descendant of this.getDescendants()) {
      yield descendant;
    }
  }

  public *getThisAndDescendantsByType<Type extends ITreeNode>(
    classType: Class<Type>
  ): Generator<Type> {
    for (const descendant of this.getThisAndDescendants()) {
      if (isInstanceOf(descendant, classType)) {
        yield descendant;
      }
    }
  }

  public *getAncestors(): Generator<TreeNode<T>> {
    let ancestor = this.parent;
    while (ancestor !== undefined) {
      yield ancestor;
      ancestor = ancestor.parent;
    }
  }

  public *getAncestorsByType<Type extends ITreeNode>(classType: Class<Type>): Generator<Type> {
    let ancestor = this.parent;
    while (ancestor !== undefined) {
      if (!isInstanceOf(ancestor, classType)) {
        break;
      }
      yield ancestor;
      ancestor = ancestor.parent;
    }
  }

  // ==================================================
  // INSTANCE METHODS: Parent child relationship
  // ==================================================

  public addChild(child: TreeNode<T>): void {
    if (this._children === undefined) {
      this._children = [];
    }
    this._children.push(child);
    child._parent = this;
    this.update();
  }

  public insertChild(index: number, child: TreeNode<T>): void {
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

  private async loadChildren(loadNodes: LoadNodesAction): Promise<void> {
    this.isLoadingChildren = true;
    const children = await loadNodes(this, true);
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
        this.addChild(child as TreeNode<T>);
      }
    }
    this.needLoadChildren = false;
  }

  public async loadSiblings(loadNodes: LoadNodesAction): Promise<void> {
    this.isLoadingSiblings = true;
    const siblings = await loadNodes(this, false);
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
      // TODO: Optimize this because of O(n*m), could be O(log(n)*m)
      if (parent.hasChild(child)) {
        continue;
      }
      index++;
      parent.insertChild(index, child as TreeNode<T>);
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
}
