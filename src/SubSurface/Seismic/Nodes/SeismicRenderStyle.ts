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
import { BaseStyle } from "@/Core/Styles/BaseStyle";
import BasePropertyFolder from "@/Core/Property/Base/BasePropertyFolder";
import { SliderProperty } from "@/Core/Property/Concrete/Property/SliderProperty";

export class SeismicRenderStyle extends BaseRenderStyle
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public opacity = new SliderProperty({ name: "Opacity", value: 0.5, use: false });

  //==================================================
  // CONSTRUCTOR
  //==================================================

  public constructor(targetId: TargetId)
  {
    super(targetId);
  }

  //==================================================
  // OVERRIDES of BaseStyle
  //==================================================

  public /*override*/ clone(): BaseStyle { return Lodash.cloneDeep<SeismicRenderStyle>(this); }

  protected /*override*/ populateCore(folder: BasePropertyFolder)
  {
    folder.addChild(this.opacity);
  }
}
