/*!
 * Copyright 2023 Cognite AS
 */

import { Menu } from '@cognite/cogs.js';
import { type ReactElement } from 'react';
import { HighFidelityContainer } from './HighFidelityContainer';
import { type SettingsContainerProps } from './types';

export const SettingsContainer = ({
  isHighFidelityMode,
  setHighFidelityMode,
  defaultsFidelityConfig,
  customHighFidelityConfig,
  customSettingsContent
}: SettingsContainerProps): ReactElement => {
  return (
    <Menu>
      <HighFidelityContainer
        isHighFidelityMode={isHighFidelityMode}
        setHighFidelityMode={setHighFidelityMode}
        defaultsFidelityConfig={defaultsFidelityConfig}
        customHighFidelityConfig={customHighFidelityConfig}
      />
      {customSettingsContent ?? <></>}
    </Menu>
  );
};
