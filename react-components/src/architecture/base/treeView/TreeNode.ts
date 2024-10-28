/*!
 * Copyright 2024 Cognite AS
 */

import { insert, remove } from '../utilities/extensions/arrayExtensions';
import { type IconName } from '../utilities/IconName';
import { type ITreeNode } from './ITreeNode';
import { CheckBoxState, type TreeNodeAction, type IconColor, type LoadNodesAction } from './types';

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
  private _isLoadingSiblings: boolean = false;
  private _needLoadChildren = false;
  private _needLoadSiblings = false;

  protected _children: TreeNode[] | undefined = undefined;
  protected _parent: TreeNode | undefined = undefined;

  // ==================================================
  // INSTANCE PROPERTIES (Some are implementation of ITreeNode)
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

  public get icon(): IconName | undefined {
    return this._icon;
  }

  public set icon(value: IconName | undefined) {
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

  // ==================================================
  // INSTANCE METHODS: Parent children methods
  // ==================================================

  public getRoot(): TreeNode {
    if (this._parent !== undefined) {
      return this._parent.getRoot();
    }
    return this;
  }

  public addChild(child: TreeNode): void {
    if (this._children === undefined) {
      this._children = [];
    }
    this._children.push(child);
    child._parent = this;
  }

  public insertChild(index: number, child: TreeNode): void {
    if (this._children === undefined) {
      this._children = [];
    }
    insert(this._children, index, child);
    child._parent = this;
  }

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
        this.addChild(child);
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
    const parent = this._parent;
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
      index++;
      parent.insertChild(index, child);
    }
    this.needLoadSiblings = false;
    parent.update();
  }

  // ==================================================
  // INSTANCE METHODS: Iterators
  // ==================================================

  public *getChildren(loadNodes?: LoadNodesAction): Generator<TreeNode> {
    if (this.isLoadingChildren) {
      loadNodes = undefined;
    }
    const canLoad = this.isParent && this._parent !== undefined;
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
