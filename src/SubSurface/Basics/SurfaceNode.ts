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

import Range3 from "@/Core/Geometry/Range3";
import { RegularGrid2 } from "@/Core/Geometry/RegularGrid2";
import { ColorType } from "@/Core/Enums/ColorType";

import { BaseRenderStyle } from "@/Core/Styles/BaseRenderStyle";
import { TargetId } from "@/Core/Primitives/TargetId";
import { SurfaceRenderStyle } from "@/SubSurface/Basics/SurfaceRenderStyle";

import Icon from "@images/Nodes/SurfaceNode.png";
import { DataNode } from "@/Core/Nodes/DataNode";
import ExpanderProperty from "@/Core/Property/Concrete/Folder/ExpanderProperty";
import { ColorMaps } from "@/Core/Primitives/ColorMaps";

export class SurfaceNode extends DataNode
{
  //==================================================
  // STATIC FIELDS
  //==================================================

  static className = "SurfaceNode";

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor()
  {
    super();
    this.colorMap = ColorMaps.terrainName;
  }

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get surface(): RegularGrid2 | null { return this.anyData; }

  public set surface(value: RegularGrid2 | null) { this.anyData = value; }

  public get renderStyle(): SurfaceRenderStyle | null { return this.getRenderStyle() as SurfaceRenderStyle; }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return SurfaceNode.className; }

  public /*override*/ isA(className: string): boolean { return className === SurfaceNode.className || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ get typeName(): string { return "Surface"; }

  public /*override*/ getIcon(): string { return this.dataIsLost ? super.getIcon() : Icon; }

  public /*override*/ get boundingBox(): Range3 { return this.surface ? this.surface.boundingBox : new Range3(); }

  public /*override*/ createRenderStyle(targetId: TargetId): BaseRenderStyle | null
  {
    return new SurfaceRenderStyle(targetId);
  }

  public /*override*/ verifyRenderStyle(style: BaseRenderStyle)
  {
    if (!(style instanceof SurfaceRenderStyle))
      return;

    if (!this.supportsColorType(style.solid.colorType))
      style.solid.colorType = ColorType.DepthColor;
    if (!this.supportsColorType(style.contours.colorType))
      style.contours.colorType = ColorType.Black;
  }

  public /*override*/ supportsColorType(colorType: ColorType): boolean
  {
    switch (colorType)
    {
      case ColorType.DepthColor:
      case ColorType.Specified:
      case ColorType.Parent:
      case ColorType.Black:
      case ColorType.White:
        return true;

      default:
        return false;
    }
  }

  protected /*override*/ populateStatisticsCore(folder: ExpanderProperty): void
  {
    super.populateStatisticsCore(folder);

    const { surface } = this;
    if (!surface)
      return;

    folder.addReadOnlyIndex2("# Cells", surface.cellSize);
    folder.addReadOnlyVector2("Spacing", surface.inc);
    folder.addReadOnlyVector2("Origin", surface.origin);
    folder.addReadOnlyAngle("Rotation", surface.rotationAngle);
    folder.addReadOnlyRange3(surface.boundingBox);
  }
}