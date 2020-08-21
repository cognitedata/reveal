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

import { DiscreteLog } from "@/SubSurface/Wells/Logs/DiscreteLog";
import { BaseLogNode } from "@/SubSurface/Wells/Nodes/BaseLogNode";
import { WellLogType } from "@/SubSurface/Wells/Logs/WellLogType";
import Icon from "@images/Nodes/DiscreteLogNode.png";
import ExpanderProperty from "@/Core/Property/Concrete/Folder/ExpanderProperty";

export class DiscreteLogNode extends BaseLogNode
{
  //==================================================
  // STATIC FIELDS
  //==================================================

  static className = "DiscreteLogNode";

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get log(): DiscreteLog | null { return this.anyData as DiscreteLog; }

  public set log(value: DiscreteLog | null) { this.anyData = value; }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return DiscreteLogNode.className; }

  public /*override*/ isA(className: string): boolean { return className === DiscreteLogNode.className || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ get typeName(): string { return "DiscreteLog"; }

  public /*override*/ getIcon(): string { return this.dataIsLost ? super.getIcon() : Icon; }

  public /*override*/ hasIconColor(): boolean { return false; }

  protected /*override*/ populateStatisticsCore(folder: ExpanderProperty): void
  {
    super.populateStatisticsCore(folder);
    const { log } = this;
    if (!log)
      return;

    folder.addReadOnlyRange1("Values", log.valueRange, 0);
  }

  //==================================================
  // OVERRIDES of BaseLogNode
  //==================================================

  public /*override*/ get wellLogType(): WellLogType { return WellLogType.Discrete; }
}