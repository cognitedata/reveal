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
import { TargetId } from "@/Core/Primitives/TargetId";
import { ColorType } from "@/Core/Enums/ColorType";
import { Polylines } from "@/Core/Geometry/Polylines";

import { BaseRenderStyle } from "@/Core/Styles/BaseRenderStyle";
import { PolylinesRenderStyle } from "@/SubSurface/Basics/PolylinesRenderStyle";
import PolylinesNodeIcon from "@images/Nodes/PolylinesNode.png";
import { DataNode } from "@/Core/Nodes/DataNode";

export class PolylinesNode extends DataNode
{
  //==================================================
  // STATIC FIELDS
  //==================================================

  static className = "PolylinesNode";

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get polylines(): Polylines | null { return this.anyData; }
  public set polylines(value: Polylines | null) { this.anyData = value; }
  public get renderStyle(): PolylinesRenderStyle | null { return this.getRenderStyle() as PolylinesRenderStyle; }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return PolylinesNode.className; }
  public /*override*/ isA(className: string): boolean { return className === PolylinesNode.className || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ get typeName(): string { return "Polylines" }

  public /*override*/ getIcon(): string { return PolylinesNodeIcon }

  public /*override*/ get boundingBox(): Range3 { return this.polylines ? this.polylines.getRange() : new Range3(); }

  public /*override*/ createRenderStyle(targetId: TargetId): BaseRenderStyle | null
  {
    return new PolylinesRenderStyle(targetId);
  }

  public /*override*/ verifyRenderStyle(style: BaseRenderStyle)
  {
    if (!(style instanceof PolylinesRenderStyle))
      return;

    if (!this.supportsColorType(style.colorType))
      style.colorType = ColorType.Specified;
  }

  public /*override*/ supportsColorType(colorType: ColorType): boolean
  {
    switch (colorType)
    {
      case ColorType.DifferentColor:
      case ColorType.Specified:
        return true;

      default:
        return false;
    }
  }
}