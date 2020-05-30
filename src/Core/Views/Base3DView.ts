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

import { Range3 } from "@/Core/Geometry/Range3";
import { BaseView } from "@/Core/Views/BaseView";
import { Changes } from "@/Core/Views/Changes";
import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";
import { ViewInfo } from "@/Core/Views/ViewInfo";

export abstract class Base3DView extends BaseView
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private _boundingBox: Range3 | undefined = undefined;

  //==================================================
  // CONSTRUCTORS
  //==================================================

  protected constructor() { super(); }

  //==================================================
  // OVERRIDES of BaseView
  //==================================================

  protected /*override*/ updateCore(args: NodeEventArgs): void
  {
    super.updateCore(args);
    if (args.isChanged(Changes.geometry))
      this.touchBoundingBox();
  }

  //==================================================
  // VIRTUAL METHODS: 
  //==================================================

  protected /*virtual*/ calculateBoundingBoxCore(): Range3 | undefined
  {
    // Override this function to recalculate the bounding box of the view
    return undefined;
  }

  protected /*virtual*/ getViewInfoCore(viewInfo: ViewInfo): void { }

  //==================================================
  // INSTANCE METHODS: 
  //==================================================

  public getViewInfo(viewInfo: ViewInfo): void
  {
    return this.getViewInfoCore(viewInfo);
  }

  public get boundingBox(): Range3 | undefined
  {
    if (!this._boundingBox)
      this._boundingBox = this.calculateBoundingBoxCore();
    return this._boundingBox;
  }

  public set boundingBox(value: Range3 | undefined) 
  {
    this._boundingBox = value;
  }

  protected touchBoundingBox(): void
  {
    this._boundingBox = undefined;
  }
}