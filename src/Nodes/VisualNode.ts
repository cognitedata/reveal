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

import { TargetId } from "../Core/TargetId";
import { ViewList } from "../Architecture/ViewList";
import { BaseRenderStyle } from "../Styles/BaseRenderStyle";
import { RenderStyleResolution } from "../Core/RenderStyleResolution";
import { NodeEventArgs } from "../Architecture/NodeEventArgs";
import { BaseNode } from "./BaseNode";
import { IVisibilityContext } from "../Architecture/IVisibilityContext";
import { RootNode } from "./RootNode";

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
  private _drawStyles: BaseRenderStyle[] = [];

  //==================================================
  // PROPERTIES
  //==================================================

  public get views(): ViewList { return this._views; }
  public get drawStyles(): BaseRenderStyle[] { return this._drawStyles; }

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
  // INSTANCE METHODS: Getters
  //==================================================

  public getActiveTarget(): IVisibilityContext | null
  {
    const root = this.root;
    if (!root)
      return null;
    if (root instanceof RootNode)
      return root.getActiveTarget();
    return null;
  }
  
  //==================================================
  // INSTANCE METHODS: Visibility and notifying
  //==================================================

  public canBeVisible(target: IVisibilityContext | null): boolean
  {
    target = target ? target : this.getActiveTarget();
    return target ? target.canShowView(this) : false;
  }

  public isVisible(target: IVisibilityContext | null): boolean
  {
    target = target ? target : this.getActiveTarget();
    return target ? target.isVisibleView(this) : false;
  }

  public setVisible(visible: boolean, target: IVisibilityContext | null): boolean
  {
    // Returns true if changed.
    target = target ? target : this.getActiveTarget();
    if (!target)
      return false;
    if (visible)
      return target.showView(this)
    else
      return target.hideView(this);
  }

  public setVisibleInteractive(visible: boolean, target: IVisibilityContext | null): void
  {
    target = target ? target : this.getActiveTarget();
    if (!target)
      return;
    if (this.setVisible(visible, target))
      this.notify(new NodeEventArgs(NodeEventArgs.nodeVisible))
  }

  public removeAllViews(): void
  {
    for (const view of this.views.list)
    {
      const target = view.getTarget() as IVisibilityContext;
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

  //==================================================
  // VIRUAL METHODS: Draw styles
  //==================================================

  public /*virtual*/ createRenderStyle(targetId: TargetId): BaseRenderStyle | null { return null; }
  public /*virtual*/ verifyRenderStyle(style: BaseRenderStyle) { /* overide when validating the drawstyle*/ }
  public /*virtual*/ get drawStyleResolution(): RenderStyleResolution { return RenderStyleResolution.Unique; }
  public /*virtual*/ get drawStyleRoot(): VisualNode | null { return null; } // To be overridden

  //==================================================
  // INSTANCE METHODS: Misc
  //==================================================

  public initialize(): void
  {
    this.initializeCore();
  }

  //==================================================
  // INSTANCE METHODS: Draw styles
  //==================================================

  public getRenderStyle(targetId: TargetId | null): BaseRenderStyle | null 
  {
    const root = this.drawStyleRoot;
    if (root != null && root !== this)
      return root.getRenderStyle(targetId);

    // Find the targetId if not present
    if (!targetId)
    {
      const target = this.getActiveTarget();
      if (target)
        targetId = target.targetId;
      else
        return null;
      if (!targetId)
        return null;
    }
    // Find the style in the node itself
    let style: BaseRenderStyle | null = null;
    for (const thisStyle of this.drawStyles)
    {
      if (thisStyle.isDefault)
        continue;

      if (!thisStyle.targetId.equals(targetId, this.drawStyleResolution))
        continue;

      style = thisStyle;
      break;
    }
    // If still not find and unique, copy one of the existing
    if (!style && this.drawStyleResolution === RenderStyleResolution.Unique)
    {
      for (const thisStyle of this.drawStyles)
      {
        if (thisStyle.isDefault)
          continue;

        if (!thisStyle.targetId.hasSameTypeName(targetId))
          continue;

        style = thisStyle.copy();
        style.isDefault = false;
        style.targetId.set(targetId, this.drawStyleResolution);
        this.drawStyles.push(style);
        break;
      }
    }
    // If still not found: Create it
    if (!style)
    {
      style = this.createRenderStyle(targetId);
      if (style)
      {
        style.targetId.set(targetId, this.drawStyleResolution);
        this.drawStyles.push(style);
      }
    }
    if (style)
      this.verifyRenderStyle(style);
    return style;
  }
}
