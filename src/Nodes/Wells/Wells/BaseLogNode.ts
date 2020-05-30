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

import { BaseVisualNode } from "@/Core/Nodes/BaseVisualNode";
import { BaseLog } from "@/Nodes/Wells/Logs/BaseLog";
import { WellNode } from "@/Nodes/Wells/Wells/WellNode";
import { WellTrajectoryNode } from "@/Nodes/Wells/Wells/WellTrajectoryNode";
import { WellTrajectory } from "@/Nodes/Wells/Logs/WellTrajectory";
import { WellLogType } from "@/Nodes/Wells/Logs/WellLogType";
import { BaseFilterLogNode } from "@/Nodes/Wells/Filters/BaseFilterLogNode";
import { Util } from "@/Core/Primitives/Util";
import { BaseTreeNode } from "@/Core/Nodes/BaseTreeNode";
import { FilterLogFolder } from "@/Nodes/Wells/Filters/FilterLogFolder";

export abstract class BaseLogNode extends BaseVisualNode
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  protected _data: BaseLog | null = null;

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get data(): BaseLog | null { return this._data; }
  public set data(value: BaseLog | null) { this._data = value; }
  public get well(): WellNode | null { return this.getAncestorByType(WellNode); }
  public get trajectoryNode(): WellTrajectoryNode | null { return this.getAncestorByType(WellTrajectoryNode); }
  public get trajectory(): WellTrajectory | null { const node = this.trajectoryNode; return node ? node.data : null; }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return BaseLogNode.name; }
  public /*override*/ isA(className: string): boolean { return className === BaseLogNode.name || super.isA(className); }

  //==================================================
  // VIRTUAL METHODS
  //==================================================

  public abstract get wellLogType(): WellLogType;

  //==================================================
  // INSTANCE METHODS
  //==================================================

  public isEqual(other: BaseFilterLogNode): boolean
  {
    return this.wellLogType == other.wellLogType && Util.equalsIgnoreCase(this.name, other.name);
  }
}