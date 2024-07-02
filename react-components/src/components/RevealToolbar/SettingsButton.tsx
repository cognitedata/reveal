/*!
 * Copyright 2023 Cognite AS
 */

import { useState, type ReactElement } from 'react';
import { Button, Menu, Tooltip as CogsTooltip, SettingsIcon } from '@cognite/cogs.js';
import { Dropdown } from '@cognite/cogs-lab';
import { type QualitySettings } from './SettingsContainer/types';
import { HighFidelityContainer } from './SettingsContainer/HighFidelityContainer';
import { useTranslation } from '../i18n/I18n';

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
  const { t } = useTranslation();
  const [settingsActive, setSettingsActive] = useState<boolean>(false);

  return (
    <CogsTooltip
      content={t('SETTINGS_TOOLTIP', 'Settings')}
      placement="right"
      appendTo={document.body}>
      <Dropdown
        onClickOutside={() => {
          setSettingsActive(false);
        }}
        content={
          <Menu>
            <HighFidelityContainer
              lowQualitySettings={lowQualitySettings}
              highQualitySettings={highQualitySettings}
            />
            {customSettingsContent ?? <></>}
          </Menu>
        }
        placement="right-start">
        <Button
          icon=<SettingsIcon />
          type="ghost"
          aria-label="Show settings"
          toggled={settingsActive}
          onClick={() => {
            setSettingsActive((prevState) => !prevState);
          }}
        />
      </Dropdown>
    </CogsTooltip>
  );
};
