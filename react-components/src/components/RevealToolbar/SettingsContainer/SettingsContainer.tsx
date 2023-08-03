/*!
 * Copyright 2023 Cognite AS
 */

import { Menu } from '@cognite/cogs.js';
import { type ReactElement } from 'react';
import { HighFidelityContainer } from './HighFidelityContainer';
import { OriginalCadColorContainer } from './OriginalCadColorContainer';

export const SettingsContainer = (): ReactElement => {
  return (
    <Menu>
      <OriginalCadColorContainer />
      <HighFidelityContainer />
    </Menu>
  );
};
