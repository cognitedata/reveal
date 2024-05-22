/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement } from 'react';
import { NavigationTool } from '../../../architecture/base/commands/NavigationTool';
import { SetTerrainVisibleCommand } from '../../../architecture/concrete/terrainDomainObject/SetTerrainVisibleCommand';
import { CommandButton } from './CommandButton';
import { UpdateTerrainCommand } from '../../../architecture/concrete/terrainDomainObject/UpdateTerrainCommand';
import { MeasurementTool } from '../../../architecture/concrete/boxDomainObject/MeasurementTool';
import { FitViewCommand } from '../../../architecture/base/concreteCommands/FitViewCommand';
import { FlexibleControlsType } from '@cognite/reveal';
import { SetFlexibleControlsTypeCommand } from '../../../architecture/base/concreteCommands/SetFlexibleControlsTypeCommand';
import { SetAxisVisibleCommand } from '../../../architecture/concrete/axis/SetAxisVisibleCommand';
import { MeasureType } from '../../../architecture/concrete/boxDomainObject/MeasureType';
import { type MeasurementObjectInfo } from '../../../architecture/concrete/boxDomainObject/addEventListenerToBoxDomainObject';

export type MeasurementCommandProps = {
  onMeasurementChangeCallback?: (measurementInfo?: MeasurementObjectInfo) => void;
};

export class RevealButtons {
  static FitView = (): ReactElement => CommandButton(new FitViewCommand());
  static NavigationTool = (): ReactElement => CommandButton(new NavigationTool());
  static SetAxisVisible = (): ReactElement => CommandButton(new SetAxisVisibleCommand());
  static SetTerrainVisible = (): ReactElement => CommandButton(new SetTerrainVisibleCommand());
  static UpdateTerrain = (): ReactElement => CommandButton(new UpdateTerrainCommand());

  static MeasureLine = (props: MeasurementCommandProps): ReactElement =>
    CommandButton(new MeasurementTool(MeasureType.Line, props.onMeasurementChangeCallback));

  static MeasurePolyline = (props: MeasurementCommandProps): ReactElement =>
    CommandButton(new MeasurementTool(MeasureType.Polyline, props.onMeasurementChangeCallback));

  static MeasurePolygon = (props: MeasurementCommandProps): ReactElement =>
    CommandButton(new MeasurementTool(MeasureType.Polygon, props.onMeasurementChangeCallback));

  static MeasureHorizontalArea = (props: MeasurementCommandProps): ReactElement =>
    CommandButton(
      new MeasurementTool(MeasureType.HorizontalArea, props.onMeasurementChangeCallback)
    );

  static MeasureVerticalArea = (props: MeasurementCommandProps): ReactElement =>
    CommandButton(new MeasurementTool(MeasureType.VerticalArea, props.onMeasurementChangeCallback));

  static MeasureVolume = (props: MeasurementCommandProps): ReactElement =>
    CommandButton(new MeasurementTool(MeasureType.Volume, props.onMeasurementChangeCallback));

  static SetFlexibleControlsTypeOrbit = (): ReactElement =>
    CommandButton(new SetFlexibleControlsTypeCommand(FlexibleControlsType.Orbit));

  static SetFlexibleControlsTypeFirstPerson = (): ReactElement =>
    CommandButton(new SetFlexibleControlsTypeCommand(FlexibleControlsType.FirstPerson));
}
