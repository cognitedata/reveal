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

export class PointLogStyle extends BaseRenderStyle
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public colorType = ColorType.Specified;
  public radius = 20;
  public readonly radiusOptions = [10, 20, 25, 30, 50, 75, 100, 200];
  public fontSize = 20; // fontSizeOptions

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(targetId: TargetId) { super(targetId); }

  //==================================================
  // OVERRIDES of BaseRenderStyle
  //==================================================

  public clone(): BaseRenderStyle
  {
    return Lodash.cloneDeep<PointLogStyle>(this);
  }
}



