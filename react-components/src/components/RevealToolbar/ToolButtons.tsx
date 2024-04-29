/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement } from 'react';
import { InfoClickTool } from '../../architecture/concreteTools/InfoClickTool';
import { NavigationTool } from '../../architecture/concreteTools/NavigationTool';
import { BaseToolButton } from './BaseToolButton';
import { SetTerrainVisibleCommand } from '../../architecture/concreteTools/SetTerrainVisibleCommand';
import { BaseCommandButton } from './BaseCommandButton';
import { UpdateTerrainCommand } from '../../architecture/concreteTools/UpdateTerrainCommand';

export const InfoToolButton = (): ReactElement => {
  return BaseToolButton((renderTarget) => new InfoClickTool(renderTarget));
};

export const NavigationToolButton = (): ReactElement => {
  return BaseToolButton((renderTarget) => new NavigationTool(renderTarget));
};

export const SetTerrainVisibleButton = (): ReactElement => {
  return BaseCommandButton((renderTarget) => new SetTerrainVisibleCommand(renderTarget));
};
export const UpdateTerrainCommandButton = (): ReactElement => {
  return BaseCommandButton((renderTarget) => new UpdateTerrainCommand(renderTarget));
};
