/*!
 * Copyright 2023 Cognite AS
 */

import { remove } from '../../../architecture/base/utilities/extensions/arrayExtensions';
import { type IconName } from '../../../architecture/base/utilities/IconName';
import { type ITreeNode, CheckBoxState, type TreeNodeAction } from './ITreeNode';

export class TreeNode implements ITreeNode {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private _label: string = '';
  private _icon: IconName | undefined = undefined;
  private _iconColor: string | undefined = undefined;
  private _isSelected: boolean = false;
  private _checkBoxState: CheckBoxState = CheckBoxState.Hidden;
  private _isExpanded: boolean = false;
  private _isEnabled: boolean = true;
  private _hasBoldLabel: boolean = false;
  private _isLoadingChildren: boolean = false;
  public _needLoading = false;

  private _children: TreeNode[] | undefined = undefined;
  private _parent: TreeNode | undefined = undefined;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get label(): string {
    return this._label;
  }

  public set label(value: string) {
    this._label = value;
  }

  public get icon(): IconName | undefined {
    return this._icon;
  }

  public set icon(value: IconName | undefined) {
    this._icon = value;
  }

  public get iconColor(): string | undefined {
    return this._iconColor;
  }

  public set iconColor(value: string | undefined) {
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

  public get checkBoxState(): CheckBoxState {
    return this._checkBoxState;
  }

  public set checkBoxState(value: CheckBoxState) {
    if (this._checkBoxState !== value) {
      this._checkBoxState = value;
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

  public get isEnabled(): boolean {
    return this._isEnabled;
  }

  public set isEnabled(value: boolean) {
    if (this._isEnabled !== value) {
      this._isEnabled = value;
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

  public get isLoadingChildren(): boolean {
    return this._isLoadingChildren;
  }

  public set isLoadingChildren(value: boolean) {
    if (this._isLoadingChildren !== value) {
      this._isLoadingChildren = value;
      this.update();
    }
  }

  public get isLeaf(): boolean {
    if (this.needLoading) {
      return false;
    }
    return this._children === undefined || this._children.length === 0;
  }

  public get needLoading(): boolean {
    return this._needLoading;
  }

  public set needLoading(value: boolean) {
    this._needLoading = value;
  }

  // ==================================================
  // INSTANCE METHODS: Parent children methods
  // ==================================================

  public addChild(child: TreeNode): void {
    if (this._children === undefined) {
      this._children = [];
    }
    this._children.push(child);
    child._parent = this;
  }

  public getRoot(): TreeNode {
    if (this._parent !== undefined) {
      return this._parent.getRoot();
    }
    return this;
  }

  // ==================================================
  // INSTANCE METHODS: Iterators
  // ==================================================

  public *getChildren(): Generator<TreeNode> {
    if (this.isLoadingChildren) {
      return;
    }
    if (this.needLoading && this._parent !== undefined) {
      void this.loadChildren();
    }
    if (this._children === undefined) {
      return;
    }
    for (const child of this._children) {
      yield child;
    }
  }

  public *getDescendants(): Generator<TreeNode> {
    for (const child of this.getChildren()) {
      yield child;
      for (const descendant of child.getDescendants()) {
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

  public *getAncestors(): Generator<TreeNode> {
    let ancestor = this._parent;
    while (ancestor !== undefined) {
      yield ancestor;
      ancestor = ancestor._parent;
    }
  }

  protected async loadChildren(): Promise<void> {
    this.isLoadingChildren = true;
    await new Promise(() =>
      setTimeout(() => {
        this.isLoadingChildren = false;
        this.needLoading = false;
      }, 2000)
    );
  }

  public calculateCheckBoxState(): CheckBoxState {
    let numCandidates = 0;
    let numAll = 0;
    let numNone = 0;

    for (const child of this.getChildren()) {
      const checkBoxState = child.checkBoxState;
      if (!child.isEnabled || checkBoxState === CheckBoxState.Hidden) {
        continue;
      }
      numCandidates++;
      if (checkBoxState === CheckBoxState.All) {
        numAll++;
      } else if (checkBoxState === CheckBoxState.None) {
        numNone++;
      }
      if (numNone < numCandidates && numCandidates < numAll) {
        return CheckBoxState.Some; // Optimization by early return
      }
    }
    if (numCandidates === 0) {
      return this.checkBoxState;
    }
    if (numCandidates === numAll) {
      return CheckBoxState.All;
    }
    if (numCandidates === numNone) {
      return CheckBoxState.None;
    }
    return CheckBoxState.Some;
  }

  private readonly _treeNodeListeners: TreeNodeAction[] = [];

  public addTreeNodeListener(listener: TreeNodeAction): void {
    this._treeNodeListeners.push(listener);
  }

  public removeTreeNodeListener(listener: TreeNodeAction): void {
    remove(this._treeNodeListeners, listener);
  }

  private update(): void {
    for (const listener of this._treeNodeListeners) {
      listener(this);
    }
  }
}

// ==================================================
// PUBLIC FUNCTIONS
// ==================================================

export function onNodeSelect(node: ITreeNode): boolean {
  if (!(node instanceof TreeNode)) {
    return false;
  }
  // Deselect all others
  const root = node.getRoot();
  for (const descendant of root.getThisAndDescendants()) {
    if (descendant !== node) {
      descendant.isSelected = false;
    }
  }
  node.isSelected = !node.isSelected;
  return true;
}

export function onNodeCheck(node: ITreeNode): boolean {
  if (!(node instanceof TreeNode)) {
    return false;
  }
  if (node.checkBoxState === CheckBoxState.All) {
    node.checkBoxState = CheckBoxState.None;
  } else {
    node.checkBoxState = CheckBoxState.All;
  }
  // Recalculate all descendants and ancestors
  for (const descendant of node.getDescendants()) {
    if (descendant.checkBoxState !== CheckBoxState.Hidden) {
      descendant.checkBoxState = node.checkBoxState;
    }
  }
  for (const ancestor of node.getAncestors()) {
    if (ancestor.checkBoxState !== CheckBoxState.Hidden) {
      ancestor.checkBoxState = ancestor.calculateCheckBoxState();
    }
  }
  return true;
}
