//= ====================================================================================
// This code is part of the Reveal Viewer architecture, made by Nils Petter Fremming
// in October 2019. It is suited for flexible and customizable visualization of
// multiple dataset in multiple viewers.
//
// It is a C# to typescript port from the Modern Model architecture,
// based on the experience when building Petrel.
//
// NOTE: Always keep the code according to the code style already applied in the file.
// Put new code under the correct section, and make more sections if needed.
// Copyright (c) Cognite AS. All rights reserved.
//= ====================================================================================

import cloneDeep from 'lodash/cloneDeep';

import { ColorType } from '../../Core/Enums/ColorType';
import { TargetId } from '../../Core/Primitives/TargetId';
import { BasePropertyFolder } from '../../Core/Property/Base/BasePropertyFolder';
import { BaseRenderStyle } from '../../Core/Styles/BaseRenderStyle';
import { BaseStyle } from '../../Core/Styles/BaseStyle';

export class PointsRenderStyle extends BaseRenderStyle {
  //= =================================================
  // INSTANCE FIELDS
  //= =================================================

  public size = 30;

  public colorType: ColorType = ColorType.ColorMap;

  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  public constructor(targetId: TargetId) {
    super(targetId);
  }

  //= =================================================
  // OVERRIDES of BaseStyle
  //= =================================================

  public /* override */ clone(): BaseStyle {
    return cloneDeep<PointsRenderStyle>(this);
  }

  protected /* override */ populateCore(_folder: BasePropertyFolder) {}
}
