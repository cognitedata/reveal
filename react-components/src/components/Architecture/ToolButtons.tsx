/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement } from 'react';
import { NavigationTool } from '../../architecture/base/commands/NavigationTool';
import { SetTerrainVisibleCommand } from '../../architecture/concrete/terrainDomainObject/SetTerrainVisibleCommand';
import { CreateButton } from './CommandButton';
import { UpdateTerrainCommand } from '../../architecture/concrete/terrainDomainObject/UpdateTerrainCommand';
import { MeasurementTool } from '../../architecture/concrete/boxDomainObject/MeasurementTool';
import { FitViewCommand } from '../../architecture/base/concreteCommands/FitViewCommand';
import { FlexibleControlsType } from '@cognite/reveal';
import { SetFlexibleControlsTypeCommand } from '../../architecture/base/concreteCommands/SetFlexibleControlsTypeCommand';
import { SetAxisVisibleCommand } from '../../architecture/concrete/axis/SetAxisVisibleCommand';

export class RevealButtons {
  static FitView = (): ReactElement => CreateButton(new FitViewCommand());
  static NavigationTool = (): ReactElement => CreateButton(new NavigationTool());
  static SetAxisVisible = (): ReactElement => CreateButton(new SetAxisVisibleCommand());
  static SetTerrainVisible = (): ReactElement => CreateButton(new SetTerrainVisibleCommand());
  static UpdateTerrain = (): ReactElement => CreateButton(new UpdateTerrainCommand());
  static Measurement = (): ReactElement => CreateButton(new MeasurementTool());

  static SetFlexibleControlsTypeOrbit = (): ReactElement =>
    CreateButton(new SetFlexibleControlsTypeCommand(FlexibleControlsType.Orbit));

  static SetFlexibleControlsTypeFirstPerson = (): ReactElement =>
    CreateButton(new SetFlexibleControlsTypeCommand(FlexibleControlsType.FirstPerson));
}
