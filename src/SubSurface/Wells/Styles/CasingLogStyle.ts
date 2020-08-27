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
import { ColorType } from "@/Core/Enums/ColorType";
import { SliderProperty } from "@/Core/Property/Concrete/Property/SliderProperty";
import { BaseStyle } from "@/Core/Styles/BaseStyle";
import BasePropertyFolder from "@/Core/Property/Base/BasePropertyFolder";
import { ColorTypeProperty } from "@/Core/Property/Concrete/Property/ColorTypeProperty";
import { NumberProperty } from "@/Core/Property/Concrete/Property/NumberProperty";

export class CasingLogStyle extends BaseRenderStyle
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public colorType = new ColorTypeProperty({ name: "Color Type", value: ColorType.Specified });
  public opacity = new SliderProperty({ name: "Opacity", value: 0.2, use: false })
  public radiusFactor = new NumberProperty({ name: "Radius Factor", value: 3, options: [1, 1.5, 2, 2.5, 3, 4, 5, 10] }); // Radius in 3D = radiusFactor * casing.radius

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(targetId: TargetId) { super(targetId); }

  //==================================================
  // OVERRIDES of BaseStyle
  //==================================================

  public /*override*/ clone(): BaseStyle { return Lodash.cloneDeep<CasingLogStyle>(this); }

  protected /*override*/ populateCore(folder: BasePropertyFolder)
  {
    super.populateCore(folder);
    folder.addChild(this.radiusFactor);
    folder.addChild(this.colorType);
    folder.addChild(this.opacity);
  }
}
