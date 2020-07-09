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

import { FloatLog } from "@/Nodes/Wells/Logs/FloatLog";
import { BaseLogNode } from "@/Nodes/Wells/Nodes/BaseLogNode";
import { WellLogType } from "@/Nodes/Wells/Logs/WellLogType";
import FloatLogNodeIcon from "@images/Nodes/FloatLogNode.png";
import { DH_NOT_SUITABLE_GENERATOR } from "constants";

export class FloatLogNode extends BaseLogNode
{
  //==================================================
  // STATIC FIELDS
  //==================================================

  static className = "FloatLogNode";

  //==================================================
  // INSTANCE FIEDLS
  //==================================================

  public unit: string | null = null;

  // TODO: NILS June, 30, 2020:
  // Add unit, take it from the metadata of the BP data

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get data(): FloatLog | null { return this.anyData as FloatLog; }
  public set data(value: FloatLog | null) { this.anyData = value; }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return FloatLogNode.className; }
  public /*override*/ isA(className: string): boolean { return className === FloatLogNode.className || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ get typeName(): string { return "FloatLog" }
  public /*override*/ getIcon(): string { return FloatLogNodeIcon }
  public /*override*/ getNameExtension(): string | null { return this.unit; }

  //==================================================
  // OVERRIDES of BaseLogNode
  //==================================================

  public /*override*/  get wellLogType(): WellLogType { return WellLogType.Float; }
}