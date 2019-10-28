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

import { BaseVisualNode } from "../Core/Nodes/BaseVisualNode";
import { BaseRenderStyle } from "../Core/Styles/BaseRenderStyle";
import { TargetId } from "../Core/PrimitivClasses/TargetId";
import { Points } from "../Core/Geometry/Points";
import { PointsRenderStyle } from "./PointsRenderStyle";
import { ColorType } from "../Core/Enums/ColorType";
import { Range3 } from "../Core/Geometry/Range3";

export class PointsNode extends BaseVisualNode
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // FIELDS
  //==================================================

  private _data: Points | null = null;

  //==================================================
  // PROPERTIES
  //==================================================

  public get data(): Points | null { return this._data; }
  public set data(value: Points | null) { this._data = value; }
  public get renderStyle(): PointsRenderStyle | null { return this.getRenderStyle() as PointsRenderStyle; }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return PointsNode.name; }
  public /*override*/ isA(className: string): boolean { return className === PointsNode.name || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ get typeName(): string { return "Points" }

  public /*override*/ get boundingBox(): Range3 { return this.data ? this.data.getRange() : new Range3(); }

  public /*override*/ createRenderStyle(targetId: TargetId): BaseRenderStyle | null
  {
    return new PointsRenderStyle(targetId);
  }

  public /*override*/ verifyRenderStyle(style: BaseRenderStyle)
  {
    if (!(style instanceof PointsRenderStyle))
      return;

    if (!this.supportsColorType(style.colorType))
      style.colorType = ColorType.NodeColor;
  }

  public /*override*/ supportsColorType(colorType: ColorType): boolean
  {
    switch (colorType)
    {
      case ColorType.DepthColor:
      case ColorType.NodeColor:
        return true;

      default:
        return false;
    }
  }
}