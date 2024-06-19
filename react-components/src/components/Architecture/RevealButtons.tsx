/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement } from 'react';
import { NavigationTool } from '../../architecture/base/concreteCommands/NavigationTool';
import { CreateButton } from './CommandButton';
import { FitViewCommand } from '../../architecture/base/concreteCommands/FitViewCommand';
import { FlexibleControlsType } from '@cognite/reveal';
import { SetFlexibleControlsTypeCommand } from '../../architecture/base/concreteCommands/SetFlexibleControlsTypeCommand';
import { SetAxisVisibleCommand } from '../../architecture/concrete/axis/SetAxisVisibleCommand';
import { ClipTool } from '../../architecture/concrete/clipping/ClipTool';
import { MeasurementTool } from '../../architecture/concrete/measurements/MeasurementTool';
import { KeyboardSpeedCommand } from '../../architecture/base/concreteCommands/KeyboardSpeedCommand';

export class RevealButtons {
  static FitView = (): ReactElement => CreateButton(new FitViewCommand());
  static NavigationTool = (): ReactElement => CreateButton(new NavigationTool());
  static SetAxisVisible = (): ReactElement => CreateButton(new SetAxisVisibleCommand());
  static Measurement = (): ReactElement => CreateButton(new MeasurementTool());
  static Clip = (): ReactElement => CreateButton(new ClipTool());
  static KeyboardSpeed = (): ReactElement => CreateButton(new KeyboardSpeedCommand());

  static SetFlexibleControlsTypeOrbit = (): ReactElement =>
    CreateButton(new SetFlexibleControlsTypeCommand(FlexibleControlsType.Orbit));

  static SetFlexibleControlsTypeFirstPerson = (): ReactElement =>
    CreateButton(new SetFlexibleControlsTypeCommand(FlexibleControlsType.FirstPerson));
}
