/*!
 * Copyright 2023 Cognite AS
 */

import { useState, type ReactElement } from 'react';
import { Button, Tooltip as CogsTooltip, SettingsIcon } from '@cognite/cogs.js';
import { Menu } from '@cognite/cogs-lab';
import { type QualitySettings } from './SettingsContainer/types';
import { HighFidelityContainer } from './SettingsContainer/HighFidelityContainer';
import { useTranslation } from '../i18n/I18n';
import { TOOLBAR_HORIZONTAL_PANEL_OFFSET } from '../constants';

import { offset } from '@floating-ui/dom';
import styled from 'styled-components';

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
    <StyledMenu
      placement="right"
      floatingProps={{ middleware: [offset(TOOLBAR_HORIZONTAL_PANEL_OFFSET)] }}
      disableCloseOnClickInside
      renderTrigger={(props: any) => (
        <CogsTooltip
          content={t({ key: 'SETTINGS_TOOLTIP' })}
          placement="right"
          disabled={settingsActive}>
          <Button
            icon=<SettingsIcon />
            type="ghost"
            aria-label="Show settings"
            toggled={settingsActive}
            onClick={() => {
              setSettingsActive((prevState) => !prevState);
            }}
            {...props}
          />
        </CogsTooltip>
      )}>
      <HighFidelityContainer
        lowQualitySettings={lowQualitySettings}
        highQualitySettings={highQualitySettings}
      />
      {customSettingsContent ?? <></>}
    </StyledMenu>
  );
};

const StyledMenu = styled(Menu)`
  z-index: 998 !important;
  max-height: 300px !important;
  overflow-y: auto !important;
`;
