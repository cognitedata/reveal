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
import { RegularGrid2 } from "@/Core/Geometry/RegularGrid2";
import { ColorType } from "@/Core/Enums/ColorType";

import { BaseVisualNode } from "@/Core/Nodes/BaseVisualNode";
import { BaseRenderStyle } from "@/Core/Styles/BaseRenderStyle";
import { TargetId } from "@/Core/Primitives/TargetId";
import { SurfaceRenderStyle } from "@/Nodes/Misc/SurfaceRenderStyle";

import SurfaceNodeIcon from "@images/Nodes/SurfaceNode.png";

export class SurfaceNode extends BaseVisualNode {

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private _data: RegularGrid2 | null = null;

  //==================================================
  // INSTANCE PROPERTIES
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

  public /*override*/ getIcon(): string { return SurfaceNodeIcon }

  public /*override*/ get boundingBox(): Range3 { return this.data ? this.data.getRange() : new Range3(); }

  public /*override*/ createRenderStyle(targetId: TargetId): BaseRenderStyle | null {
    return new SurfaceRenderStyle(targetId);
  }

  public /*override*/ verifyRenderStyle(style: BaseRenderStyle) {
    if (!(style instanceof SurfaceRenderStyle))
      return;

    if (!this.supportsColorType(style.solid.colorType))
      style.solid.colorType = ColorType.DepthColor;
    if (!this.supportsColorType(style.contours.colorType))
      style.contours.colorType = ColorType.Black;
  }

  public /*override*/ supportsColorType(colorType: ColorType): boolean {
    switch (colorType) {
      case ColorType.DepthColor:
      case ColorType.NodeColor:
      case ColorType.Black:
      case ColorType.White:
        return true;

      default:
        return false;
    }
  }
}