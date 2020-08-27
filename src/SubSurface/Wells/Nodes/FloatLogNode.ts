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

import { FloatLog } from "@/SubSurface/Wells/Logs/FloatLog";
import { BaseLogNode } from "@/SubSurface/Wells/Nodes/BaseLogNode";
import { WellLogType } from "@/SubSurface/Wells/Logs/WellLogType";
import Icon from "@images/Nodes/FloatLogNode.png";
import BasePropertyFolder from "@/Core/Property/Base/BasePropertyFolder";

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

  public get log(): FloatLog | null { return this.anyData as FloatLog; }

  public set log(value: FloatLog | null) { this.anyData = value; }

  //==================================================
  // CONSTRUCTOR
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

  public /*override*/ get typeName(): string { return "FloatLog"; }

  public /*override*/ getIcon(): string { return this.dataIsLost ? super.getIcon() : Icon; }

  public /*override*/ getNameExtension(): string | null { return this.unit; }

  protected /*override*/ populateStatisticsCore(folder: BasePropertyFolder): void
  {
    super.populateStatisticsCore(folder);
    const { log } = this;
    if (!log)
      return;

    folder.addReadOnlyRange1(null, log.valueRange);
    folder.addReadOnlyStatistics(null, log.statistics);
  }

  //==================================================
  // OVERRIDES of BaseLogNode
  //==================================================

  public /*override*/ get wellLogType(): WellLogType { return WellLogType.Float; }
}