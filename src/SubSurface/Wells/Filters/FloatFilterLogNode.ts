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

import { BaseRenderStyle } from "@/Core/Styles/BaseRenderStyle";
import { FloatLogStyle } from "@/SubSurface/Wells/Styles/FloatLogStyle";
import { TargetId } from "@/Core/Primitives/TargetId";
import { BaseFilterLogNode } from "@/SubSurface/Wells/Filters/BaseFilterLogNode";
import { WellLogType } from "@/SubSurface/Wells/Logs/WellLogType";
import FloatLogNodeIcon from "@images/Nodes/FloatLogNode.png";
import { ColorType } from "@/Core/Enums/ColorType";
import Range1 from "@/Core/Geometry/Range1";
import BasePropertyFolder from "@/Core/Property/Base/BasePropertyFolder";
import { Statistics } from "@/Core/Geometry/Statistics";
import { FloatLogNode } from "@/SubSurface/Wells/Nodes/FloatLogNode";

export class FloatFilterLogNode extends BaseFilterLogNode
{
  //==================================================
  // STATIC FIELDS
  //==================================================

  static className = "FloatFilterLogNode";

  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public propertyType = "";
  public unit = "";

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get renderStyle(): FloatLogStyle | null { return this.getRenderStyle() as FloatLogStyle; }

  //==================================================
  // CONSTRUCTOR
  //==================================================

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return FloatFilterLogNode.className; }
  public /*override*/ isA(className: string): boolean { return className === FloatFilterLogNode.className || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ get typeName(): string { return "FloatLog"; }
  public /*override*/ getIcon(): string { return FloatLogNodeIcon; }
  public /*override*/ hasColorMap(): boolean { return true; }

  public /*override*/ createRenderStyle(targetId: TargetId): BaseRenderStyle | null
  {
    return new FloatLogStyle(targetId);
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

  protected /*override*/ populateInfoCore(folder: BasePropertyFolder): void
  {
    super.populateInfoCore(folder);
    folder.addString({ name: "propertyType", instance: this, readonly: false });
    folder.addString({ name: "unit", instance: this, readonly: false });
  }

  protected /*override*/ populateStatisticsCore(folder: BasePropertyFolder): void
  {
    super.populateStatisticsCore(folder);
    const statistics = this.getStatistics();
    folder.addReadOnlyRange1("Values", statistics.range);
    folder.addReadOnlyStatistics("Statistics", statistics);
  }

  public /*override*/ verifyRenderStyle(style: BaseRenderStyle)
  {
    if (!(style instanceof FloatLogStyle))
      return;

    const valueRange = this.getValueRange();
    if (valueRange.isEmpty)
      return;

    function round(value: number) { return Math.round(value * 10000) / 10000; }
    if (Number.isNaN(style.min.value))
      style.min.value = round(valueRange.min);
    if (Number.isNaN(style.max.value))
      style.max.value = round(valueRange.max);
  }

  //==================================================
  // OVERRIDES of BaseLogNode
  //==================================================

  public /*override*/ get wellLogType(): WellLogType { return WellLogType.Float; }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  public getValueRange(): Range1
  {
    return this.getStatistics().range;
  }

  private getStatistics(): Statistics
  {
    const statistics = new Statistics();
    for (const logNode of this.getAllLogs())
    {
      if (!(logNode instanceof FloatLogNode))
        continue;

      // if (!logNode.hasDataInMemory)
      //   continue;
      const { log } = logNode;
      if (!log)
        continue;

      statistics.addStatistics(log.statistics);
    }
    return statistics;
  }
}