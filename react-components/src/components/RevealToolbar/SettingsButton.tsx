/*!
 * Copyright 2023 Cognite AS
 */

import { useState, type ReactElement } from 'react';
import { Button, Tooltip as CogsTooltip, SettingsIcon } from '@cognite/cogs.js';
import { Menu } from '@cognite/cogs-lab';
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
      disabled={settingsActive}
      appendTo={document.body}>
      <Menu
        placement="right"
        renderTrigger={(props) => (
          <Button
            {...props}
            icon=<SettingsIcon />
            type="ghost"
            aria-label="Show settings"
            toggled={settingsActive}
            onClick={() => {
              setSettingsActive((prevState) => !prevState);
            }}
          />
        )}>
        <HighFidelityContainer
          lowQualitySettings={lowQualitySettings}
          highQualitySettings={highQualitySettings}
        />
        {customSettingsContent ?? <></>}
      </Menu>
    </CogsTooltip>
  );
};
