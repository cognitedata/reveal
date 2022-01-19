//= ====================================================================================
// This code is part of the Reveal Viewer architecture, made by Nils Petter Fremming
// in October 2019. It is suited for flexible and customizable visualization of
// multiple dataset in multiple viewers.
//
// It is a C# to typescript port from the Modern Model architecture,
// based on the experience when building Petrel.
//
// NOTE: Always keep the code according to the code style already applied in the file.
// Put new code under the correct section, and make more sections if needed.
// Copyright (c) Cognite AS. All rights reserved.
//= ====================================================================================

import { ViewList } from "@/Core/Views/ViewList";
import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";
import { BaseNode } from "@/Core/Nodes/BaseNode";
import { ITarget } from "@/Core/Interfaces/ITarget";
import { CheckBoxState } from "@/Core/Enums/CheckBoxState";
import { Util } from "@/Core/Primitives/Util";
import { ITargetIdAccessor } from "@/Core/Interfaces/ITargetIdAccessor";
import { BaseView } from "@/Core/Views/BaseView";

export abstract class BaseVisualNode extends BaseNode {
  //= =================================================
  // STATIC FIELDS
  //= =================================================

  static className = "BaseVisualNode";

  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  protected constructor() { super(); }

  //= =================================================
  // INSTANCE FIELDS
  //= =================================================

  private _views: ViewList = new ViewList();

  //= =================================================
  // INSTANCE PROPERTIES
  //= =================================================

  public get views(): ViewList { return this._views; }

  //= =================================================
  // OVERRIDES of Identifiable
  //= =================================================

  public /* override */ get className(): string { return BaseVisualNode.className; }

  public /* override */ isA(className: string): boolean { return className === BaseVisualNode.className || super.isA(className); }

  //= =================================================
  // OVERRIDES of BaseNode
  //= =================================================

  public /* override */ getCheckBoxState(target?: ITarget | null): CheckBoxState {
    if (!target) {
      // eslint-disable-next-line no-param-reassign
      target = this.activeTarget;
      if (!target)
        return CheckBoxState.Never;
    }
    if (this.hasView(target))
      return CheckBoxState.All;

    if (this.canBeVisible(target)) {
      if (this.canBeChecked(target))
        return CheckBoxState.None;
      return CheckBoxState.CanNotBeChecked;
    }
    return CheckBoxState.Never;
  }

  public /* override */ setVisibleInteractive(visible: boolean, target?: ITarget | null, topLevel = true): boolean {
    if (!target) {
      // eslint-disable-next-line no-param-reassign
      target = this.activeTarget;
      if (!target)
        return false;
    }
    if (visible) {
      if (!this.canBeChecked(target))
        return false;

      if (this.isRadio(target)) {
        // Turn the others off
        if (this.parent) {
          for (const sibling of this.parent.getDescendants()) {
            if (sibling === this)
              continue;
            if (sibling.className !== this.className)
              continue;
            sibling.setVisibleInteractive(false, target);
          }
        }
      }
    }
    if (!this.setVisible(visible, target))
      return false;

    if (topLevel)
      this.notifyVisibleStateChange();
    return true;
  }

  protected /* override */ removeInternalData(): void {
    this.removeAllViews();
    super.removeInternalData();
  }

  public /* override */ getDebugString(): string {
    let result = super.getDebugString();
    if (this.views.count > 0)
      result += Util.cocatinate("views", this.views.count);
    return result;
  }

  public /* override */notifyCore(args: NodeEventArgs): void {
    super.notifyCore(args);
    for (const view of this.views.list)
      view.update(args);
  }

  //= =================================================
  // VIRTUAL METHODS:
  //= =================================================

  public canBeVisible(target?: ITarget | null): boolean {
    if (!target)
      // eslint-disable-next-line no-param-reassign
      target = this.activeTarget;
    return target ? target.canShowView(this) : false;
  }

  public canBeVisibleNow(): boolean { return true; }

  //= =================================================
  // INSTANCE METHODS: Visibility and notifying
  //= =================================================

  public getViewByTarget(target: ITargetIdAccessor): BaseView | null {
    return this.views.getViewByTarget(target);
  }

  public isVisible(target?: ITarget | null): boolean {
    if (!target)
      // eslint-disable-next-line no-param-reassign
      target = this.activeTarget;
    return target ? target.hasVisibleView(this) : false;
  }

  public hasView(target?: ITarget | null): boolean {
    if (!target)
      // eslint-disable-next-line no-param-reassign
      target = this.activeTarget;
    return target ? target.hasView(this) : false;
  }

  public setVisible(visible: boolean, target?: ITarget | null): boolean {
    if (visible && !this.canBeVisibleNow())
      return false;

    // Returns true if changed.
    if (!target) {
      // eslint-disable-next-line no-param-reassign
      target = this.activeTarget;
      if (!target)
        return false;
    }
    if (visible)
      return target.showView(this);
    return target.hideView(this);
  }

  public removeAllViews(): void {
    for (const view of this.views.list) {
      const target = view.getTarget() as ITarget;
      if (!target)
        continue;

      target.removeViewShownHere(view);
    }
    this.views.clear();
  }
}
