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

import { PointLog } from "@/SubSurface/Wells/Logs/PointLog";
import { BaseLogNode } from "@/SubSurface/Wells/Nodes/BaseLogNode";
import { WellLogType } from "@/SubSurface/Wells/Logs/WellLogType";
import PointLogNodeIcon from "@images/Nodes/PointLogNode.png";
import { PropertyFolder } from "@/Core/Property/Concrete/Folder/PropertyFolder";

export class PointLogNode extends BaseLogNode
{
  //==================================================
  // STATIC FIELDS
  //==================================================

  static className = "PointLogNode";

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get log(): PointLog | null { return this.anyData as PointLog; }
  public set log(value: PointLog | null) { this.anyData = value; }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return PointLogNode.className; }
  public /*override*/ isA(className: string): boolean { return className === PointLogNode.className || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ get typeName(): string { return "RiskLog" }
  public /*override*/ getIcon(): string { return PointLogNodeIcon }

  public /*override*/ populateStatistics(folder: PropertyFolder): void
  {
    super.populateStatistics(folder);
  }

  //==================================================
  // OVERRIDES of BaseLogNode
  //==================================================

  public /*override*/  get wellLogType(): WellLogType { return WellLogType.Point; }
}