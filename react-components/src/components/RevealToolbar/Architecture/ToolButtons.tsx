/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement } from 'react';
import { NavigationTool } from '../../../architecture/base/concreteCommands/NavigationTool';
import { SetTerrainVisibleCommand } from '../../../architecture/concrete/terrainDomainObject/SetTerrainVisibleCommand';
import { CommandButton } from './CommandButton';
import { UpdateTerrainCommand } from '../../../architecture/concrete/terrainDomainObject/UpdateTerrainCommand';
import { BoxEditTool } from '../../../architecture/concrete/boxDomainObject/BoxEditTool';
import { FitViewCommand } from '../../../architecture/base/concreteCommands/FitViewCommand';
import { FlexibleControlsType } from '@cognite/reveal';
import { SetFlexibleControlsTypeCommand } from '../../../architecture/base/concreteCommands/SetFlexibleControlsTypeCommand';
import { SetAxisVisibleCommand } from '../../../architecture/concrete/axis/SetAxisVisibleCommand';

type CreateElementDelegate = () => ReactElement;

export type RevealButtonsType = {
  FitView: CreateElementDelegate;
  NavigationTool: CreateElementDelegate;
  SetAxisVisible: CreateElementDelegate;
  SetTerrainVisible: CreateElementDelegate;
  UpdateTerrain: CreateElementDelegate;
  BoxEditTool: CreateElementDelegate;
  SetFlexibleControlsTypeOrbit: CreateElementDelegate;
  SetFlexibleControlsTypeFirstPerson: CreateElementDelegate;
};

export const RevealButtons: RevealButtonsType = {
  FitView: () => CommandButton(new FitViewCommand()),
  NavigationTool: () => CommandButton(new NavigationTool()),
  SetAxisVisible: () => CommandButton(new SetAxisVisibleCommand()),
  SetTerrainVisible: () => CommandButton(new SetTerrainVisibleCommand()),
  UpdateTerrain: () => CommandButton(new UpdateTerrainCommand()),
  BoxEditTool: () => CommandButton(new BoxEditTool()),
  SetFlexibleControlsTypeOrbit: () =>
    CommandButton(new SetFlexibleControlsTypeCommand(FlexibleControlsType.Orbit)),
  SetFlexibleControlsTypeFirstPerson: () =>
    CommandButton(new SetFlexibleControlsTypeCommand(FlexibleControlsType.FirstPerson))
};
