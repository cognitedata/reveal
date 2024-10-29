/*!
 * Copyright 2024 Cognite AS
 */

import { type ReactElement } from 'react';
import { NavigationTool } from '../../architecture/base/concreteCommands/NavigationTool';
import { FitViewCommand } from '../../architecture/base/concreteCommands/FitViewCommand';
import { FlexibleControlsType, type Image360Action } from '@cognite/reveal';
import { SetFlexibleControlsTypeCommand } from '../../architecture/base/concreteCommands/SetFlexibleControlsTypeCommand';
import { SetAxisVisibleCommand } from '../../architecture/concrete/axis/SetAxisVisibleCommand';
import { ClipTool } from '../../architecture/concrete/clipping/ClipTool';
import { MeasurementTool } from '../../architecture/concrete/measurements/MeasurementTool';
import { KeyboardSpeedCommand } from '../../architecture/base/concreteCommands/KeyboardSpeedCommand';
import { PointsOfInterestTool } from '../../architecture/concrete/pointsOfInterest/PointsOfInterestTool';
import { createButtonFromCommandConstructor } from './CommandButtons';
import { SettingsCommand } from '../../architecture/base/concreteCommands/SettingsCommand';
import { PointCloudFilterCommand } from '../../architecture';
import { SetOrbitOrFirstPersonModeCommand } from '../../architecture/base/concreteCommands/SetOrbitOrFirstPersonModeCommand';

import { AnnotationsShowCommand } from '../../architecture/concrete/annotations/commands/AnnotationsShowCommand';
import { AnnotationsShowOnTopCommand } from '../../architecture/concrete/annotations/commands/AnnotationsShowOnTopCommand';
import { AnnotationsCreateTool } from '../../architecture/concrete/annotations/commands/AnnotationsCreateTool';
import { AnnotationsSelectTool } from '../../architecture/concrete/annotations/commands/AnnotationsSelectTool';
import { Image360ActionCommand } from '../../architecture/base/concreteCommands/image360Collection/Image360ActionCommand';

export class RevealButtons {
  static Settings = ({ include360Images = true }: { include360Images?: boolean }): ReactElement =>
    createButtonFromCommandConstructor(() => new SettingsCommand(include360Images));

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

  static PointsOfInterest = (): ReactElement => {
    return createButtonFromCommandConstructor(() => new PointsOfInterestTool());
  };

  static KeyboardSpeed = (): ReactElement =>
    createButtonFromCommandConstructor(() => new KeyboardSpeedCommand());

  static Image360Action = ({ action }: { action: Image360Action }): ReactElement =>
    createButtonFromCommandConstructor(() => new Image360ActionCommand(action));

  // Annotations
  static AnnotationsSelect = (): ReactElement =>
    createButtonFromCommandConstructor(() => new AnnotationsSelectTool());

  static AnnotationsCreate = (): ReactElement =>
    createButtonFromCommandConstructor(() => new AnnotationsCreateTool());

  static AnnotationsShow = (): ReactElement =>
    createButtonFromCommandConstructor(() => new AnnotationsShowCommand());

  static AnnotationsShowOnTop = (): ReactElement =>
    createButtonFromCommandConstructor(() => new AnnotationsShowOnTopCommand());
}
