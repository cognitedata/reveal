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

import { TargetId } from '../../../Core/Primitives/TargetId';
import { BaseRenderStyle } from '../../../Core/Styles/BaseRenderStyle';
import { ColorType } from '../../../Core/Enums/ColorType';
import { BaseStyle } from '../../../Core/Styles/BaseStyle';
import { BasePropertyFolder } from '../../../Core/Property/Base/BasePropertyFolder';
import { ColorTypeProperty } from '../../../Core/Property/Concrete/Property/ColorTypeProperty';
import { NumberProperty } from '../../../Core/Property/Concrete/Property/NumberProperty';
import { BooleanProperty } from '../../../Core/Property/Concrete/Property/BooleanProperty';

export class WellTrajectoryStyle extends BaseRenderStyle {
  //= =================================================
  // INSTANCE FIELDS
  //= =================================================

  public showWellName = new BooleanProperty({
    name: 'Show Well Name',
    value: true,
  });

  public showTrajectoryName = new BooleanProperty({
    name: 'Show Trajectory Name',
    value: true,
  });

  public nameColorType = new ColorTypeProperty({
    name: 'Name Color',
    value: ColorType.ForeGround,
  });

  public nameFontSize = new NumberProperty({
    name: 'Name Font Size',
    value: 50,
    options: BaseRenderStyle.fontSizeOptions,
  });

  public trajectoryColorType = new ColorTypeProperty({
    name: 'Trajectory Color',
    value: ColorType.White,
  });

  public radius = new NumberProperty({
    name: 'Radius',
    value: 5,
    options: [1, 2, 3, 5, 10, 20, 30, 40, 50],
    toolTip: 'The radius of the well trajectorty',
  });

  public bandFontSize = new NumberProperty({
    name: 'Band Font Size',
    value: 30,
    options: BaseRenderStyle.fontSizeOptions,
    toolTip: 'The font of the md values drawn in the bands',
  });

  public bandWidth = new NumberProperty({
    name: 'Band Width',
    value: 200,
    options: [20, 25, 30, 50, 75, 100, 200, 250, 300],
  });

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
    return cloneDeep<WellTrajectoryStyle>(this);
  }

  protected /* override */ populateCore(folder: BasePropertyFolder) {
    super.populateCore(folder);

    this.nameColorType.isEnabledDelegate = (): boolean =>
      this.showWellName.value || this.showTrajectoryName.value;
    this.nameFontSize.isEnabledDelegate = (): boolean =>
      this.showWellName.value || this.showTrajectoryName.value;

    folder.addChild(this.showWellName);
    folder.addChild(this.showTrajectoryName);
    folder.addChild(this.nameColorType);
    folder.addChild(this.nameFontSize);
    folder.addChild(this.trajectoryColorType);
    folder.addChild(this.radius);
    folder.addChild(this.bandFontSize);
    folder.addChild(this.bandWidth);
  }
}
