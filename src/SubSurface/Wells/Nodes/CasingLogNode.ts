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

import { CasingLog } from "@/SubSurface/Wells/Logs/CasingLog";
import { BaseLogNode } from "@/SubSurface/Wells/Nodes/BaseLogNode";
import { WellLogType } from "@/SubSurface/Wells/Logs/WellLogType";
import CasingLogNodeIcon from "@images/Nodes/CasingLogNode.png";
import { PropertyFolder } from "@/Core/Property/Concrete/Folder/PropertyFolder";

export class CasingLogNode extends BaseLogNode
{
  //==================================================
  // STATIC FIELDS
  //==================================================

  static className = "CasingLogNode";

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get log(): CasingLog | null { return this.anyData as CasingLog; }

  public set log(value: CasingLog | null) { this.anyData = value; }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return CasingLogNode.className; }

  public /*override*/ isA(className: string): boolean { return className === CasingLogNode.className || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ get typeName(): string { return "Casing"; }

  public /*override*/ getIcon(): string { return CasingLogNodeIcon; }

  protected /*override*/ populateStatisticsCore(folder: PropertyFolder): void
  {
    super.populateStatisticsCore(folder);
    const { log } = this;
    if (!log)
      return;

    folder.addReadOnlyRange1("Radius", log.radiusRange, 0);
  }

  //==================================================
  // OVERRIDES of BaseLogNode
  //==================================================

  public /*override*/ get wellLogType(): WellLogType { return WellLogType.Casing; }
}