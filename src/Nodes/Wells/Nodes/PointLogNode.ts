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

import { PointLog } from "@/Nodes/Wells/Logs/PointLog";
import { BaseLogNode } from "@/Nodes/Wells/Nodes/BaseLogNode";
import { WellLogType } from "@/Nodes/Wells/Logs/WellLogType";
import PointLogNodeIcon from "@images/Nodes/PointLogNode.png";

export class PointLogNode extends BaseLogNode
{
  //==================================================
  // STATIC FIELDS
  //==================================================

  static className = "PointLogNode";

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get data(): PointLog | null { return this.anyData as PointLog; }
  public set data(value: PointLog | null) { this.anyData = value; }

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

  public /*override*/ get typeName(): string { return "PointLog" }
  public /*override*/ getIcon(): string { return PointLogNodeIcon }

  //==================================================
  // OVERRIDES of BaseLogNode
  //==================================================

  public /*override*/  get wellLogType(): WellLogType { return WellLogType.Point; }
}