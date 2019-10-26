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
import { RegularGrid2 } from "../Core/Geometry/RegularGrid2";
import { SurfaceRenderStyle } from "./SurfaceRenderStyle";
import { ColorType } from "../Core/Enums/ColorType";
import { Range3 } from "../Core/Geometry/Range3";

export class SurfaceNode extends BaseVisualNode
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // FIELDS
  //==================================================

  private _data: RegularGrid2 | null = null;

  //==================================================
  // PROPERTIES
  //==================================================

  public get data(): RegularGrid2 | null { return this._data; }
  public set data(value: RegularGrid2 | null) { this._data = value; }
  public get renderStyle(): SurfaceRenderStyle | null { return this.getRenderStyle() as SurfaceRenderStyle; }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return SurfaceNode.name; }
  public /*override*/ isA(className: string): boolean { return className === SurfaceNode.name || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ get typeName(): string { return "Surface" }

  public /*override*/ createRenderStyle(targetId: TargetId): BaseRenderStyle | null
  {
    return new SurfaceRenderStyle(targetId);
  }

  public /*override*/ verifyRenderStyle(style: BaseRenderStyle)
  {
    if (!(style instanceof SurfaceRenderStyle))
      return;

    if (!this.supportsColorType(style.colorType))
      style.colorType = ColorType.NodeColor;
  }

  public /*override*/ supportsColorType(colorType: ColorType): boolean
  {
    switch (colorType)
    {
      case ColorType.DifferentColor:
      case ColorType.NodeColor:
        return true;

      default:
        return false;
    }
  }

  public getRange(): Range3 { return this.data ? this.data.getRange() : new Range3(); }
}