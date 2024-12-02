/*!
 * Copyright 2024 Cognite AS
 */

import { type ReactElement } from 'react';

import { type PlacementType } from './types';
import { type Vector3 } from 'three';

import { FlexibleControlsType, Image360Action } from '@cognite/reveal';

import { NavigationTool } from '../../architecture/base/concreteCommands/NavigationTool';
import { FitViewCommand } from '../../architecture/base/concreteCommands/FitViewCommand';
import { SetFlexibleControlsTypeCommand } from '../../architecture/base/concreteCommands/SetFlexibleControlsTypeCommand';
import { SetAxisVisibleCommand } from '../../architecture/concrete/axis/SetAxisVisibleCommand';
import { ClipTool } from '../../architecture/concrete/clipping/ClipTool';
import { MeasurementTool } from '../../architecture/concrete/measurements/MeasurementTool';
import { KeyboardSpeedCommand } from '../../architecture/base/concreteCommands/KeyboardSpeedCommand';
import { PointsOfInterestTool } from '../../architecture/concrete/pointsOfInterest/PointsOfInterestTool';
import { createButtonFromCommandConstructor } from './CommandButtons';
import { SettingsCommand } from '../../architecture/base/concreteCommands/SettingsCommand';
import { SetOrbitOrFirstPersonModeCommand } from '../../architecture/base/concreteCommands/SetOrbitOrFirstPersonModeCommand';

import { AnnotationsShowCommand } from '../../architecture/concrete/annotations/commands/AnnotationsShowCommand';
import { AnnotationsShowOnTopCommand } from '../../architecture/concrete/annotations/commands/AnnotationsShowOnTopCommand';
import { AnnotationsCreateTool } from '../../architecture/concrete/annotations/commands/AnnotationsCreateTool';
import { AnnotationsSelectTool } from '../../architecture/concrete/annotations/commands/AnnotationsSelectTool';
import { Image360ActionCommand } from '../../architecture/base/concreteCommands/image360Collection/Image360ActionCommand';
import { InitiatePointsOfInterestCommand } from '../../architecture/concrete/pointsOfInterest/InitiatePointsOfInterestCommand';
import { DeleteSelectedPointsOfInterestCommand } from '../../architecture/concrete/pointsOfInterest/DeletePointsOfInterestCommand';

import { Image360AnnotationCreateTool } from '../../architecture/concrete/annotation360/Image360AnnotationCreateTool';
import { Image360AnnotationSelectTool } from '../../architecture/concrete/annotation360/Image360AnnotationSelectTool';
import { PointCloudFilterCommand } from '../../architecture/base/concreteCommands/pointCloud/PointCloudFilterCommand';
import { UndoCommand } from '../../architecture/base/concreteCommands/UndoCommand';

export class RevealButtons {
  static Settings = (props: SettingsProp): ReactElement =>
    createButtonFromCommandConstructor(
      () => new SettingsCommand(props.include360Images, props.includePois),
      props
    );

  static PointCloudFilter = (prop: ButtonProp): ReactElement =>
    createButtonFromCommandConstructor(() => new PointCloudFilterCommand(), prop);

  static FitView = (prop: ButtonProp): ReactElement =>
    createButtonFromCommandConstructor(() => new FitViewCommand(), prop);

  static NavigationTool = (prop: ButtonProp): ReactElement =>
    createButtonFromCommandConstructor(() => new NavigationTool(), prop);

  static SetAxisVisible = (prop: ButtonProp): ReactElement =>
    createButtonFromCommandConstructor(() => new SetAxisVisibleCommand(), prop);

  static Measurement = (prop: ButtonProp): ReactElement =>
    createButtonFromCommandConstructor(() => new MeasurementTool(), prop);

  static Clip = (prop: ButtonProp): ReactElement =>
    createButtonFromCommandConstructor(() => new ClipTool(), prop);

  static Undo = (prop: ButtonProp): ReactElement =>
    createButtonFromCommandConstructor(() => new UndoCommand(), prop);

  static SetOrbitOrFirstPersonMode = (prop: ButtonProp): ReactElement =>
    createButtonFromCommandConstructor(() => new SetOrbitOrFirstPersonModeCommand(), prop);

  static SetOrbitMode = (prop: ButtonProp): ReactElement =>
    createButtonFromCommandConstructor(
      () => new SetFlexibleControlsTypeCommand(FlexibleControlsType.Orbit),
      prop
    );

  static SetFirstPersonMode = (prop: ButtonProp): ReactElement =>
    createButtonFromCommandConstructor(
      () => new SetFlexibleControlsTypeCommand(FlexibleControlsType.FirstPerson),
      prop
    );

  static PointsOfInterest = (prop: ButtonProp): ReactElement =>
    createButtonFromCommandConstructor(() => new PointsOfInterestTool(), prop);

  static PointsOfInterestInitiateCreation = (
    prop: { point: Vector3; clickEvent: PointerEvent } & ButtonProp
  ): ReactElement =>
    createButtonFromCommandConstructor(
      () => new InitiatePointsOfInterestCommand(prop.point, prop.clickEvent),
      prop
    );

  static DeleteSelectedPointOfInterest = (prop: ButtonProp): ReactElement =>
    createButtonFromCommandConstructor(() => new DeleteSelectedPointsOfInterestCommand(), prop);

  static KeyboardSpeed = (prop: ButtonProp): ReactElement =>
    createButtonFromCommandConstructor(() => new KeyboardSpeedCommand(), prop);

  static Image360Button = (prop: Image360Prop): ReactElement =>
    createButtonFromCommandConstructor(() => new Image360ActionCommand(prop.action), prop);

  static Image360Buttons = (prop: ButtonProp): ReactElement => {
    return (
      <>
        <RevealButtons.Image360Button {...prop} action={Image360Action.Enter} />
        <RevealButtons.Image360Button {...prop} action={Image360Action.Backward} />
        <RevealButtons.Image360Button {...prop} action={Image360Action.Forward} />
        <RevealButtons.Image360Button {...prop} action={Image360Action.Exit} />
      </>
    );
  };

  // 2D Annotations (Image360 Polygon)
  static Image360AnnotationCreateTool = (prop: ButtonProp): ReactElement =>
    createButtonFromCommandConstructor(() => new Image360AnnotationCreateTool(), prop);

  static Image360AnnotationSelectTool = (prop: ButtonProp): ReactElement =>
    createButtonFromCommandConstructor(() => new Image360AnnotationSelectTool(), prop);

  // 3D Annotations
  static AnnotationsSelect = (prop: ButtonProp): ReactElement =>
    createButtonFromCommandConstructor(() => new AnnotationsSelectTool(), prop);

  static AnnotationsCreate = (prop: ButtonProp): ReactElement =>
    createButtonFromCommandConstructor(() => new AnnotationsCreateTool(), prop);

  static AnnotationsShow = (prop: ButtonProp): ReactElement =>
    createButtonFromCommandConstructor(() => new AnnotationsShowCommand(), prop);

  static AnnotationsShowOnTop = (prop: ButtonProp): ReactElement =>
    createButtonFromCommandConstructor(() => new AnnotationsShowOnTopCommand(), prop);
}

export type ButtonProp = {
  toolbarPlacement?: PlacementType;
};

type SettingsProp = ButtonProp & {
  include360Images?: boolean;
  includePois?: boolean;
};

type Image360Prop = ButtonProp & {
  action: Image360Action;
};
