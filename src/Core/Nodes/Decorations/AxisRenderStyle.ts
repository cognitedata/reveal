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

import * as Lodash from "lodash";

import { TargetId } from "@/Core/Primitives/TargetId";
import { BaseRenderStyle } from "@/Core/Styles/BaseRenderStyle";
import { BasePropertyFolder } from "@/Core/Property/Base/BasePropertyFolder";
import { BaseStyle } from "@/Core/Styles/BaseStyle";

export class AxisRenderStyle extends BaseRenderStyle
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public showAxis = true;
  public showAxisLabel = true;
  public showAxisNumbers = true;
  public showAxisTicks = true;
  public showGrid = true;
  public numTicks = 50; // Appoximately number of ticks for the largest axis
  public tickLength = 0.005; // In fraction of the bounding box diagonal
  public tickFontSize = 1.5; // In fraction of the real tickLength
  public labelFontSize = 3; // In fraction of the real tickLength

  //==================================================
  // CONSTRUCTOR
  //==================================================

  public constructor(targetId: TargetId) { super(targetId); }

  //==================================================
  // OVERRIDES of BaseStyle
  //==================================================

  public /*override*/ clone(): BaseStyle { return Lodash.cloneDeep<AxisRenderStyle>(this); }
  protected /*override*/ populateCore(folder: BasePropertyFolder) { }
}
