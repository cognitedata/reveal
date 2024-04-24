/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement } from 'react';
import { InfoClickTool } from '../../architecture/concreteTools/InfoClickTool';
import { NavigationTool } from '../../architecture/concreteTools/NavigationTool';
import { BaseToolButton } from './BaseToolButton';

export const InfoToolButton = (): ReactElement => {
  return BaseToolButton((renderTarget) => new InfoClickTool(renderTarget));
};

export const NavigationToolButton = (): ReactElement => {
  return BaseToolButton((renderTarget) => new NavigationTool(renderTarget));
};
