/*!
 * Copyright 2023 Cognite AS
 */

import { useState, type ReactElement } from 'react';
import { Button, Dropdown } from '@cognite/cogs.js';
import { SettingsContainer } from './SettingsContainer/SettingsContainer';

export const SettingsButton = (): ReactElement => {
  const [settingsEnabled, setSettingsEnabled] = useState(false);
  const SettingsButton = (): void => {
    setSettingsEnabled(!settingsEnabled);
  };

  return (
    <Dropdown
      appendTo={document.body}
      content={<SettingsContainer />}
      visible={settingsEnabled}
      placement="auto">
      <Button onClick={SettingsButton} icon="Settings" type="ghost" aria-label="Show settings" />
    </Dropdown>
  );
};
