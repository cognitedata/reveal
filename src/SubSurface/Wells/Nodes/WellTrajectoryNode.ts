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

import { BaseRenderStyle } from "@/Core/Styles/BaseRenderStyle";
import { TargetId } from "@/Core/Primitives/TargetId";
import { WellTrajectoryStyle } from "@/SubSurface/Wells/Styles/WellTrajectoryStyle";
import { WellTrajectory } from "@/SubSurface/Wells/Logs/WellTrajectory";
import { WellNode } from "@/SubSurface/Wells/Nodes/WellNode";
import { FilterLogFolder } from "@/SubSurface/Wells/Filters/FilterLogFolder";

import WellTrajectoryNodeIcon from "@images/Nodes/WellTrajectoryNode.png";
import { DataNode } from "@/Core/Nodes/DataNode";
import { PropertyFolder } from "@/Core/Property/Concrete/Folder/PropertyFolder";
import { BaseTreeNode } from "@/Core/Nodes/BaseTreeNode";

export class WellTrajectoryNode extends DataNode
{
  //==================================================
  // STATIC FIELDS
  //==================================================

  static className = "WellTrajectoryNode";

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get trajectory(): WellTrajectory | null { return this.anyData; }
  public set trajectory(value: WellTrajectory | null) { this.anyData = value; }
  public get renderStyle(): WellTrajectoryStyle | null { return this.getRenderStyle() as WellTrajectoryStyle; }
  public get wellNode(): WellNode | null { return this.getAncestorByType(WellNode); }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return WellTrajectoryNode.className; }
  public /*override*/ isA(className: string): boolean { return className === WellTrajectoryNode.className || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ get typeName(): string { return "WellTrajectory" }

  public /*override*/ getIcon(): string { return WellTrajectoryNodeIcon }

  public /*override*/ get boundingBox(): Range3 { return this.trajectory ? this.trajectory.range : new Range3(); }

  public /*override*/ createRenderStyle(targetId: TargetId): BaseRenderStyle | null
  {
    return new WellTrajectoryStyle(targetId);
  }

  public /*override*/ verifyRenderStyle(style: BaseRenderStyle)
  {
    if (!(style instanceof WellTrajectoryStyle))
      return;

    if (!this.supportsColorType(style.colorType))
      style.colorType = ColorType.Specified;
  }

  public /*override*/ supportsColorType(colorType: ColorType): boolean
  {
    switch (colorType)
    {
      case ColorType.Specified:
      case ColorType.Parent:
      case ColorType.Black:
      case ColorType.White:
        return true;

      default:
        return false;
    }
  }

  protected /*override*/ populateStatisticsCore(folder: PropertyFolder): void
  {
    super.populateStatisticsCore(folder);
    const trajectory = this.trajectory;
    if (!trajectory)
      return;

    folder.addReadOnlyRange1("Md", trajectory.mdRange, 2);
    folder.addReadOnlyRange3("", trajectory.range, 2);
  }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  public getFilterLogFolder(): FilterLogFolder | null
  {
    const tree = this.getAncestorByType(BaseTreeNode);
    if (!tree)
      return null;

    return tree.getChildByType(FilterLogFolder);
  }
}