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
import { ColorTypeProperty } from "@/Core/Property/Concrete/Property/ColorTypeProperty";
import { NumberProperty } from "@/Core/Property/Concrete/Property/NumberProperty";

export class WellTrajectoryStyle extends BaseRenderStyle
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public colorType = new ColorTypeProperty({ name: "Color Type", value: ColorType.White });
  public radius = new NumberProperty({ name: "Radius", value: 5, options: [1, 2, 3, 5, 10, 20, 30, 40, 50] }); 
  public bandWidth = new NumberProperty({ name: "Band Width", value: 50, options: [20, 25, 30, 50, 75, 100, 200] });
  public nameFontSize = new NumberProperty({ name: "Name Font Size", value: 50, options: BaseRenderStyle.fontSizeOptions }); 
  public bandFontSize = new NumberProperty({ name: "Band Font Size", value: 30, options: BaseRenderStyle.fontSizeOptions }); 

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(targetId: TargetId) { super(targetId); }

  //==================================================
  // OVERRIDES of BaseStyle
  //==================================================

  public /*override*/ clone(): BaseStyle { return Lodash.cloneDeep<WellTrajectoryStyle>(this); }

  protected /*override*/ populateCore(folder: BasePropertyFolder)
  {
    super.populateCore(folder);
    folder.addChild(this.colorType);
    folder.addChild(this.radius);
    folder.addChild(this.nameFontSize);
    folder.addChild(this.bandFontSize);
    folder.addChild(this.bandWidth);
  }
}
