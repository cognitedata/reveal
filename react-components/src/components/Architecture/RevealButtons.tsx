/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement } from 'react';
import { NavigationTool } from '../../architecture/base/concreteCommands/NavigationTool';
import { CreateCommandButton } from './CommandButton';
import { FitViewCommand } from '../../architecture/base/concreteCommands/FitViewCommand';
import { FlexibleControlsType } from '@cognite/reveal';
import { SetFlexibleControlsTypeCommand } from '../../architecture/base/concreteCommands/SetFlexibleControlsTypeCommand';
import { SetAxisVisibleCommand } from '../../architecture/concrete/axis/SetAxisVisibleCommand';
import { ClipTool } from '../../architecture/concrete/clipping/ClipTool';
import { MeasurementTool } from '../../architecture/concrete/measurements/MeasurementTool';
import { SetKeyboardSpeedCommand } from '../../architecture/base/concreteCommands/SetKeyboardSpeedCommand';

export class RevealButtons {
  static FitView = (): ReactElement => CreateCommandButton(new FitViewCommand());
  static NavigationTool = (): ReactElement => CreateCommandButton(new NavigationTool());
  static SetAxisVisible = (): ReactElement => CreateCommandButton(new SetAxisVisibleCommand());
  static Measurement = (): ReactElement => CreateCommandButton(new MeasurementTool());
  static Clip = (): ReactElement => CreateCommandButton(new ClipTool());
  static SetKeyboardSpeed = (): ReactElement => CreateCommandButton(new SetKeyboardSpeedCommand());

  static SetFlexibleControlsTypeOrbit = (): ReactElement =>
    CreateCommandButton(new SetFlexibleControlsTypeCommand(FlexibleControlsType.Orbit));

  static SetFlexibleControlsTypeFirstPerson = (): ReactElement =>
    CreateCommandButton(new SetFlexibleControlsTypeCommand(FlexibleControlsType.FirstPerson));
}
