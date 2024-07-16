/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement } from 'react';
import { NavigationTool } from '../../architecture/base/concreteCommands/NavigationTool';
import { FitViewCommand } from '../../architecture/base/concreteCommands/FitViewCommand';
import { FlexibleControlsType } from '@cognite/reveal';
import { SetFlexibleControlsTypeCommand } from '../../architecture/base/concreteCommands/SetFlexibleControlsTypeCommand';
import { SetAxisVisibleCommand } from '../../architecture/concrete/axis/SetAxisVisibleCommand';
import { ClipTool } from '../../architecture/concrete/clipping/ClipTool';
import { MeasurementTool } from '../../architecture/concrete/measurements/MeasurementTool';
import { KeyboardSpeedCommand } from '../../architecture/base/concreteCommands/KeyboardSpeedCommand';
import { createCommandButton } from './CommandButton';
import { ObservationsTool } from '../../architecture/concrete/observations/ObservationsTool';

export class RevealButtons {
  static FitView = (): ReactElement => createCommandButton(() => new FitViewCommand());

  static NavigationTool = (): ReactElement => createCommandButton(() => new NavigationTool());

  static SetAxisVisible = (): ReactElement =>
    createCommandButton(() => new SetAxisVisibleCommand());

  static Measurement = (): ReactElement => createCommandButton(() => new MeasurementTool());

  static Clip = (): ReactElement => createCommandButton(() => new ClipTool());

  static SetFlexibleControlsTypeOrbit = (): ReactElement =>
    createCommandButton(() => new SetFlexibleControlsTypeCommand(FlexibleControlsType.Orbit));

  static SetFlexibleControlsTypeFirstPerson = (): ReactElement =>
    createCommandButton(() => new SetFlexibleControlsTypeCommand(FlexibleControlsType.FirstPerson));

  static Observations = (): ReactElement => {
    return createCommandButton(() => new ObservationsTool());
  };

  static KeyboardSpeed = (): ReactElement => createCommandButton(() => new KeyboardSpeedCommand());
}
