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
import { BasePropertyFolder } from "@/Core/Property/Base/BasePropertyFolder";
import { BandPositionProperty } from "@/Core/Property/Concrete/Property/BandPositionProperty";
import { BandPosition } from "@/Core/Enums/BandPosition";

export class DiscreteLogStyle extends BaseRenderStyle
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public bandPosition = new BandPositionProperty({ name: "Band Position", value: BandPosition.Automatic });

  //==================================================
  // CONSTRUCTOR
  //==================================================

  public constructor(targetId: TargetId) { super(targetId); }

  //==================================================
  // OVERRIDES of BaseStyle
  //==================================================

  public /*override*/ clone(): BaseStyle { return Lodash.cloneDeep<DiscreteLogStyle>(this); }

  protected /*override*/ populateCore(folder: BasePropertyFolder)
  {
    super.populateCore(folder);
    folder.addChild(this.bandPosition);
  }
}
