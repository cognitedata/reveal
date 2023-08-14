/*!
 * Copyright 2023 Cognite AS
 */

import { useState, type ReactElement } from 'react';
import { Button, Dropdown } from '@cognite/cogs.js';
import { SettingsContainer } from './SettingsContainer/SettingsContainer';

type CustomSettingsProps = {
  customSettingsContent?: ReactElement;
};

export const SettingsButton = ({ customSettingsContent }: CustomSettingsProps): ReactElement => {
  const [, setSettingsEnabled] = useState(false);
  const [isHighQualityMode, setHighQualityMode] = useState(false);
  const SettingsButton = (): void => {
    setSettingsEnabled((prevState) => !prevState);
  };

  return (
    <Dropdown
      appendTo={document.body}
      content={
        <SettingsContainer
          customSettingsContent={customSettingsContent}
          isHighFidelityMode={isHighQualityMode}
          setHighFidelityMode={setHighQualityMode}
        />
      }
      placement="auto">
      <Button onClick={SettingsButton} icon="Settings" type="ghost" aria-label="Show settings" />
    </Dropdown>
  );
};
