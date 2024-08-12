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
import { SettingsCommand } from '../../architecture/base/commands/SettingsCommand';
import { SetPointColorTypeCommand } from '../../architecture/base/concreteCommands/SetPointColorTypeCommand';
import { SetPointShapeCommand } from '../../architecture/base/concreteCommands/SetPointShapeCommand';
import { SetPointSizeCommand } from '../../architecture/base/concreteCommands/SetPointSizeCommand';
import { SetQualityCommand } from '../../architecture/base/concreteCommands/SetQualityCommand';
import { PointCloudFilterCommand } from '../../architecture/base/concreteCommands/PointCloudFilterCommand';

export class RevealButtons {
  static Settings = (): ReactElement => createButtonFromCommandConstructor(() => createSettings());

  static FitView = (): ReactElement =>
    createButtonFromCommandConstructor(() => new FitViewCommand());

  static NavigationTool = (): ReactElement =>
    createButtonFromCommandConstructor(() => new NavigationTool());

  static SetAxisVisible = (): ReactElement =>
    createButtonFromCommandConstructor(() => new SetAxisVisibleCommand());

  static Measurement = (): ReactElement =>
    createButtonFromCommandConstructor(() => new MeasurementTool());

  static Clip = (): ReactElement => createButtonFromCommandConstructor(() => new ClipTool());

  static SetFlexibleControlsTypeOrbit = (): ReactElement =>
    createButtonFromCommandConstructor(
      () => new SetFlexibleControlsTypeCommand(FlexibleControlsType.Orbit)
    );

  static SetFlexibleControlsTypeFirstPerson = (): ReactElement =>
    createButtonFromCommandConstructor(
      () => new SetFlexibleControlsTypeCommand(FlexibleControlsType.FirstPerson)
    );

  static Observations = (): ReactElement => {
    return createButtonFromCommandConstructor(() => new ObservationsTool());
  };

  static KeyboardSpeed = (): ReactElement =>
    createButtonFromCommandConstructor(() => new KeyboardSpeedCommand());
}

function createSettings(): SettingsCommand {
  const settings = new SettingsCommand();
  settings.add(new SetQualityCommand());
  settings.add(new SetPointSizeCommand());
  settings.add(new SetPointColorTypeCommand());
  settings.add(new SetPointShapeCommand());
  settings.add(new PointCloudFilterCommand());
  return settings;
}
