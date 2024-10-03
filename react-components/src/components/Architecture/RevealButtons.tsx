/*!
 * Copyright 2024 Cognite AS
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
import { ObservationsTool } from '../../architecture/concrete/observations/ObservationsTool';
import { createButtonFromCommandConstructor } from './CommandButtons';
import { SettingsCommand } from '../../architecture/base/concreteCommands/SettingsCommand';
import { PointCloudFilterCommand } from '../../architecture';
import { SetOrbitOrFirstPersonModeCommand } from '../../architecture/base/concreteCommands/SetOrbitOrFirstPersonModeCommand';

export class RevealButtons {
  static Settings = (): ReactElement =>
    createButtonFromCommandConstructor(() => new SettingsCommand());

  static PointCloudFilter = (): ReactElement =>
    createButtonFromCommandConstructor(() => new PointCloudFilterCommand());

  static FitView = (): ReactElement =>
    createButtonFromCommandConstructor(() => new FitViewCommand());

  static NavigationTool = (): ReactElement =>
    createButtonFromCommandConstructor(() => new NavigationTool());

  static SetAxisVisible = (): ReactElement =>
    createButtonFromCommandConstructor(() => new SetAxisVisibleCommand());

  static Measurement = (): ReactElement =>
    createButtonFromCommandConstructor(() => new MeasurementTool());

  static Clip = (): ReactElement => createButtonFromCommandConstructor(() => new ClipTool());

  static SetOrbitOrFirstPersonMode = (): ReactElement =>
    createButtonFromCommandConstructor(() => new SetOrbitOrFirstPersonModeCommand());

  static SetOrbitMode = (): ReactElement =>
    createButtonFromCommandConstructor(
      () => new SetFlexibleControlsTypeCommand(FlexibleControlsType.Orbit)
    );

  static SetFirstPersonMode = (): ReactElement =>
    createButtonFromCommandConstructor(
      () => new SetFlexibleControlsTypeCommand(FlexibleControlsType.FirstPerson)
    );

  static Observations = (): ReactElement => {
    return createButtonFromCommandConstructor(() => new ObservationsTool());
  };

  static KeyboardSpeed = (): ReactElement =>
    createButtonFromCommandConstructor(() => new KeyboardSpeedCommand());
}
