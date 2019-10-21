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

import { ViewList } from "../Architecture/ViewList";
import { NodeEventArgs } from "../Architecture/NodeEventArgs";
import { BaseNode } from "./BaseNode";
import { Target } from "../Architecture/Target";

export abstract class VisualNode extends BaseNode
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  protected constructor() { super(); }

  //==================================================
  // FIELDS
  //==================================================

  private _views: ViewList = new ViewList();

  //==================================================
  // PROPERTIES
  //==================================================

  public get views(): ViewList { return this._views; }
  private get activeTarget(): Target | null { return this.activeTargetIdAccessor as Target; }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return VisualNode.name }
  public /*override*/ isA(className: string): boolean { return className === VisualNode.name || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ removeInteractive(): void
  {
    this.removeAllViews();
    super.removeInteractive();
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
      return target.showView(this)
      return target.hideView(this);
  }

  public setVisibleInteractive(visible: boolean, target?: Target | null): void
  {
    if (!target)
      target = this.activeTarget;
    if (!target)
      return;
    if (this.setVisible(visible, target))
      this.notify(new NodeEventArgs(NodeEventArgs.nodeVisible))
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
