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

import * as Lodash from 'lodash';

import { TargetId } from "@/Core/Primitives/TargetId";
import { BaseRenderStyle } from "@/Core/Styles/BaseRenderStyle";
import { ColorType } from "@/Core/Enums/ColorType";
import { PropertyFolder } from "@/Core/Property/Concrete/Folder/PropertyFolder";

export class WellTrajectoryStyle extends BaseRenderStyle
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public colorType = ColorType.White;

  public radius = 5; // [1,2,3,5,10,20,30,40,50];

  public nameFontSize = 50; // fontSizeOptions

  public bandFontSize = 30; // fontSizeOptions

  public bandWidth = 50;

  public readonly bandWidthOptions = [20, 25, 30, 50, 75, 100, 200];

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(targetId: TargetId) { super(targetId); }

  //==================================================
  // OVERRIDES of BaseRenderStyle
  //==================================================

  public /*override*/ clone(): BaseRenderStyle { return Lodash.cloneDeep<WellTrajectoryStyle>(this); }

  protected /*override*/ PopulateCore(folder: PropertyFolder)
  {
    super.PopulateCore(folder);
  }
}
