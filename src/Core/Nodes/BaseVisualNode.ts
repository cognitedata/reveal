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

import { ViewList } from "@/Core/Views/ViewList";
import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";
import { BaseNode, cocatinate } from "@/Core/Nodes/BaseNode";
import { Target } from "@/Core/Interfaces/Target";
import { Changes } from "@/Core/Views/Changes";
import { CheckBoxState } from "@/Core/Enums/CheckBoxState";

export abstract class BaseVisualNode extends BaseNode
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  protected constructor() { super(); }

  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private _views: ViewList = new ViewList();

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get views(): ViewList { return this._views; }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return BaseVisualNode.name }
  public /*override*/ isA(className: string): boolean { return className === BaseVisualNode.name || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ getCheckBoxState(target?: Target | null): CheckBoxState
  {
    if (!target)
      target = this.activeTarget;

    if (!target)
      return CheckBoxState.Never;

    if (this.isVisible(target))
      return CheckBoxState.All;

    if (this.canBeVisible(target))
      return CheckBoxState.None;

    return CheckBoxState.Never;
  }

  public /*override*/setVisibleInteractive(visible: boolean, target?: Target | null): void
  {
    if (!target)
      target = this.activeTarget;
    if (!target)
      return;
    if (this.setVisible(visible, target))
      this.notify(new NodeEventArgs(Changes.visible));
  }

  protected /*override*/ removeInteractiveCore(): void
  {
    this.removeAllViews();
    super.removeInteractiveCore();
  }

  public /*override*/ getDebugString(): string
  {
    let result = super.getDebugString();
    if (this.views.count > 0)
      result += cocatinate("views", this.views.count);
    return result;
  }

  //==================================================
  // INSTANCE METHODS: Visibility and notifying
  //==================================================

  public canBeVisible(target?: Target | null): boolean
  {
    if (!target)
      target = this.activeTarget;
    return target ? target.canShowView(this) : false;
  }

  public isVisible(target?: Target | null): boolean
  {
    if (!target)
      target = this.activeTarget;
    return target ? target.isVisibleView(this) : false;
  }

  public setVisible(visible: boolean, target?: Target | null): boolean
  {
    // Returns true if changed.
    if (!target)
      target = this.activeTarget;
    if (!target)
      return false;
    if (visible)
      return target.showView(this);
    return target.hideView(this);
  }

  public removeAllViews(): void
  {
    for (const view of this.views.list)
    {
      const target = view.getTarget() as Target;
      if (!target)
        continue;

      target.removeViewShownHere(view);
    }
    this.views.clear();
  }

  public notifyCore(args: NodeEventArgs): void
  {
    super.notifyCore(args);
    for (const view of this._views.list)
      view.update(args);
  }
}
