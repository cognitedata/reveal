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

import { BaseVisualNode } from "@/Core/Nodes/BaseVisualNode";
import { BaseRenderStyle } from "@/Core/Styles/BaseRenderStyle";
import { TargetId } from "@/Core/Primitives/TargetId";
import { WellRenderStyle } from "@/Nodes/Wells/Wells/WellRenderStyle";
import { WellTrajectory } from "@/Nodes/Wells/Logs/WellTrajectory";
import { WellNode } from "@/Nodes/Wells/Wells/WellNode";

export class WellTrajectoryNode extends BaseVisualNode
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private _data: WellTrajectory | null = null;

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get data(): WellTrajectory | null { return this._data; }
  public set data(value: WellTrajectory | null) { this._data = value; }
  public get renderStyle(): WellRenderStyle | null { return this.getRenderStyle() as WellRenderStyle; }
  public get well(): WellNode | null { return this.getAncestorByType(WellNode); }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return WellTrajectoryNode.name; }
  public /*override*/ isA(className: string): boolean { return className === WellTrajectoryNode.name || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ get typeName(): string { return "WellTrajectory" }

  public /*override*/ get boundingBox(): Range3 { return this.data ? this.data.range : new Range3(); }

  public /*override*/ createRenderStyle(targetId: TargetId): BaseRenderStyle | null
  {
    return new WellRenderStyle(targetId);
  }

  public /*override*/ verifyRenderStyle(style: BaseRenderStyle)
  {
    if (!(style instanceof WellRenderStyle))
      return;

    if (!this.supportsColorType(style.colorType))
      style.colorType = ColorType.NodeColor;
  }

  public /*override*/ supportsColorType(colorType: ColorType): boolean
  {
    switch (colorType)
    {
      case ColorType.NodeColor:
        return true;

      default:
        return false;
    }
  }
}