/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement } from 'react';
import { NavigationTool } from '../../../architecture/concreteCommands/NavigationTool';
import { SetTerrainVisibleCommand } from '../../../architecture/terrainDomainObject/SetTerrainVisibleCommand';
import { CommandButton } from './CommandButton';
import { UpdateTerrainCommand } from '../../../architecture/terrainDomainObject/UpdateTerrainCommand';
import { SetBoxVisibleCommand } from '../../../architecture/boxDomainObject/SetBoxVisibleCommand';
import { BoxEditTool } from '../../../architecture/boxDomainObject/BoxEditTool';
import { FitViewCommand } from '../../../architecture/concreteCommands/FitViewCommand';
import { FlexibleControlsType } from '@cognite/reveal';
import { SetFlexibleControlsTypeCommand } from '../../../architecture/concreteCommands/SetFlexibleControlsTypeCommand';

type CreateElementDelegate = () => ReactElement;

export type RevealButtonsType = {
  FitView: CreateElementDelegate;
  NavigationTool: CreateElementDelegate;
  SetTerrainVisible: CreateElementDelegate;
  UpdateTerrain: CreateElementDelegate;
  SetBoxVisible: CreateElementDelegate;
  BoxEditTool: CreateElementDelegate;
  SetFlexibleControlsTypeOrbit: CreateElementDelegate;
  SetFlexibleControlsTypeFirstPerson: CreateElementDelegate;
};

export const RevealButtons: RevealButtonsType = {
  FitView: () => CommandButton(new FitViewCommand()),
  NavigationTool: () => CommandButton(new NavigationTool()),
  SetTerrainVisible: () => CommandButton(new SetTerrainVisibleCommand()),
  UpdateTerrain: () => CommandButton(new UpdateTerrainCommand()),
  SetBoxVisible: () => CommandButton(new SetBoxVisibleCommand()),
  BoxEditTool: () => CommandButton(new BoxEditTool()),
  SetFlexibleControlsTypeOrbit: () =>
    CommandButton(new SetFlexibleControlsTypeCommand(FlexibleControlsType.Orbit)),
  SetFlexibleControlsTypeFirstPerson: () =>
    CommandButton(new SetFlexibleControlsTypeCommand(FlexibleControlsType.FirstPerson))
};
