/*!
 * Copyright 2023 Cognite AS
 */

import { useState, type ReactElement } from 'react';
import { Button, Dropdown, Menu, Tooltip as CogsTooltip } from '@cognite/cogs.js';
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
    <Dropdown
      appendTo={document.body}
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
      <CogsTooltip
        content={t('SETTINGS_TOOLTIP', 'Settings')}
        placement="right"
        appendTo={document.body}>
        <Button
          icon="Settings"
          type="ghost"
          aria-label="Show settings"
          toggled={settingsActive}
          onClick={() => {
            setSettingsActive((prevState) => !prevState);
          }}
        />
      </CogsTooltip>
    </Dropdown>
  );
};
