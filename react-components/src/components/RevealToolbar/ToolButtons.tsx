/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement } from 'react';
import { InfoClickTool } from '../../architecture/ConcreteTools/InfoClickTool';
import { NavigationTool } from '../../architecture/ConcreteTools/NavigationTool';
import { BaseToolButton } from './BaseToolButton';

export const InfoToolButton = (): ReactElement => {
  return BaseToolButton((renderTarget) => new InfoClickTool(renderTarget));
};

export const NavigationToolButton = (): ReactElement => {
  return BaseToolButton((renderTarget) => new NavigationTool(renderTarget));
};
