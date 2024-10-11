/*!
 * Copyright 2023 Cognite AS
 */

import { type IconName } from '../../../architecture/base/utilities/IconName';
import { type ITreeNode, CheckBoxState } from './ITreeNode';

export class TreeNode implements ITreeNode {
  private _label: string = '';
  private _icon: IconName | undefined = undefined;
  private _children: TreeNode[] | undefined = undefined;
  private _parent: TreeNode | undefined = undefined;
  private _isSelected: boolean = false;
  private _checkedBoxState: CheckBoxState = CheckBoxState.Hidden;
  private _isExpanded: boolean = false;
  private _isEnabled: boolean = true;
  private _hasBoldLabel: boolean = false;

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

  public get isSelected(): boolean {
    return this._isSelected;
  }

  public set isSelected(value: boolean) {
    this._isSelected = value;
  }

  public get checkedBoxState(): CheckBoxState {
    return this._checkedBoxState;
  }

  public set checkedBoxState(value: CheckBoxState) {
    this._checkedBoxState = value;
  }

  public get isExpanded(): boolean {
    return this._isExpanded;
  }

  public set isExpanded(value: boolean) {
    this._isExpanded = value;
  }

  public get isEnabled(): boolean {
    return this._isEnabled;
  }

  public set isEnabled(value: boolean) {
    this._isEnabled = value;
  }

  public get hasBoldLabel(): boolean {
    return this._hasBoldLabel;
  }

  public set hasBoldLabel(value: boolean) {
    this._hasBoldLabel = value;
  }

  public addChild(child: TreeNode): void {
    if (this._children === undefined) {
      this._children = [];
    }
    this._children.push(child);
    child._parent = this;
  }

  public get isLeaf(): boolean {
    return this._children === undefined || this._children.length === 0;
  }

  public *getVisibleChildren(): Generator<ITreeNode> {
    if (!this.isExpanded) {
      return;
    }
    for (const child of this.getChildren()) {
      yield child;
    }
  }

  public *getChildren(): Generator<ITreeNode> {
    if (this._children === undefined) {
      return;
    }
    for (const child of this._children) {
      yield child;
    }
  }

  public *getDescendants(): Generator<TreeNode> {
    for (const child of this.getChildren()) {
      if (!(child instanceof TreeNode)) {
        continue;
      }
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

  public calculateCheckBoxState(): CheckBoxState {
    let numCandidates = 0;
    let numAll = 0;
    let numNone = 0;

    if (this._children === undefined) {
      return this.checkedBoxState;
    }
    for (const child of this._children) {
      const checkBoxState = child.checkedBoxState;
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
        return CheckBoxState.Some;
      }
    }
    if (numCandidates === 0) {
      return this.checkedBoxState;
    }
    if (numCandidates === numAll) {
      return CheckBoxState.All;
    }
    if (numCandidates === numNone) {
      return CheckBoxState.None;
    }
    return CheckBoxState.Some;
  }
}

export function createMock(): TreeNode {
  const root = new TreeNode();
  root.label = 'Root';
  root.isExpanded = true;

  for (let i = 1; i <= 100; i++) {
    const child = new TreeNode();
    child.label = 'Folder ' + i;
    child.isExpanded = true;
    child.icon = 'Snow';
    child.checkedBoxState = CheckBoxState.Some;
    root.addChild(child);

    for (let j = 1; j <= 5; j++) {
      const child1 = new TreeNode();
      child1.label = 'Folder ' + i + '.' + j;
      child1.icon = 'Snow';
      child1.isExpanded = false;
      child1.checkedBoxState = CheckBoxState.None;
      child1.isEnabled = j !== 2;

      child.addChild(child1);

      for (let k = 1; k <= 5; k++) {
        const child2 = new TreeNode();
        child2.icon = 'Bug';
        child2.label = 'Child ' + i + '.' + j + '.' + k;
        child2.checkedBoxState = CheckBoxState.None;
        child2.isEnabled = k !== 3;
        child1.addChild(child2);
      }
    }
  }
  return root;
}
