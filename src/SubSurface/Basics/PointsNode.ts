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

import { ColorType } from "@/Core/Enums/ColorType";
import { Range3 } from "@/Core/Geometry/Range3";
import { Points } from "@/Core/Geometry/Points";

import { BaseRenderStyle } from "@/Core/Styles/BaseRenderStyle";
import { TargetId } from "@/Core/Primitives/TargetId";
import { PointsRenderStyle } from "@/SubSurface/Basics/PointsRenderStyle";
import PointsNodeIcon from "@images/Nodes/PointsNode.png";
import { DataNode } from "@/Core/Nodes/DataNode";

export class PointsNode extends DataNode
{
  //==================================================
  // STATIC FIELDS
  //==================================================

  static className = "PointsNode";

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get points(): Points | null { return this.anyData; }

  public set points(value: Points | null) { this.anyData = value; }

  public get renderStyle(): PointsRenderStyle | null { return this.getRenderStyle() as PointsRenderStyle; }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return PointsNode.className; }

  public /*override*/ isA(className: string): boolean { return className === PointsNode.className || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ get typeName(): string { return "Points"; }

  public /*override*/ getIcon(): string { return PointsNodeIcon; }

  public /*override*/ get boundingBox(): Range3 { return this.points ? this.points.boundingBox : new Range3(); }

  public /*override*/ createRenderStyle(targetId: TargetId): BaseRenderStyle | null
  {
    return new PointsRenderStyle(targetId);
  }

  public /*override*/ verifyRenderStyle(style: BaseRenderStyle)
  {
    if (!(style instanceof PointsRenderStyle))
      return;

    if (!this.supportsColorType(style.colorType))
      style.colorType = ColorType.Specified;
  }

  public /*override*/ supportsColorType(colorType: ColorType): boolean
  {
    switch (colorType)
    {
      case ColorType.DepthColor:
      case ColorType.Specified:
        return true;

      default:
        return false;
    }
  }
}