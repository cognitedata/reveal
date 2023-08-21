/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement } from 'react';
import { Button, Dropdown, Menu } from '@cognite/cogs.js';
import { type QualitySettings } from './SettingsContainer/types';
import { HighFidelityContainer } from './SettingsContainer/HighFidelityContainer';

type CustomSettingsProps = {
  customSettingsContent?: ReactElement;
  lowQualitySettings?: Partial<QualitySettings>;
  highQualitySettings?: Partial<QualitySettings>;
};

export const SettingsButton = ({
  customSettingsContent,
  lowQualitySettings,
  highQualitySettings
}: CustomSettingsProps): ReactElement => {
  return (
    <Dropdown
      appendTo={document.body}
      content={
        <Menu>
          <HighFidelityContainer
            lowQualitySettings={lowQualitySettings}
            highQualitySettings={highQualitySettings}
          />
          {customSettingsContent ?? <></>}
        </Menu>
      }
      placement="auto">
      <Button icon="Settings" type="ghost" aria-label="Show settings" />
    </Dropdown>
  );
};
