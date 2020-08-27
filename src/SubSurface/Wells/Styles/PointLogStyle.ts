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
import { BaseStyle } from "@/Core/Styles/BaseStyle";
import BasePropertyFolder from "@/Core/Property/Base/BasePropertyFolder";
import { NumberProperty } from "@/Core/Property/Concrete/Property/NumberProperty";
import { ColorTypeProperty } from "@/Core/Property/Concrete/Property/ColorTypeProperty";

export class PointLogStyle extends BaseRenderStyle
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public colorType = new ColorTypeProperty({ name: "Color Type", value: ColorType.Specified });
  public radius = new NumberProperty({ name: "Radius", value: 20, options: [10, 20, 25, 30, 50, 75, 100, 200] }); 
  public fontSize = new NumberProperty({ name: "Font Size", value: 20, options: BaseRenderStyle.fontSizeOptions }); 

  //==================================================
  // CONSTRUCTOR
  //==================================================

  public constructor(targetId: TargetId) { super(targetId); }

  //==================================================
  // OVERRIDES of BaseStyle
  //==================================================

  public /*override*/ clone(): BaseStyle { return Lodash.cloneDeep<PointLogStyle>(this); }

  protected /*override*/ populateCore(folder: BasePropertyFolder)
  {
    super.populateCore(folder);
    folder.addChild(this.colorType);
    folder.addChild(this.radius);
    folder.addChild(this.fontSize);
  }
}
