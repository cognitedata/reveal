/*!
 * Copyright 2023 Cognite AS
 */

import { useState, type ReactElement, useRef } from 'react';
import { Button, Dropdown, Menu, Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { type QualitySettings } from './SettingsContainer/types';
import { HighFidelityContainer } from './SettingsContainer/HighFidelityContainer';
import { useOutsideClick } from '../../hooks/useOutsideClick';

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
  const [settingsActive, setSettingsActive] = useState<boolean>(false);
  const handleClickOutside = (): void => {
    setSettingsActive(false);
  };
  const ref = useRef<HTMLButtonElement | null>(null);
  useOutsideClick(ref, handleClickOutside);
  return (
    <CogsTooltip content={'Settings'} placement="right" appendTo={document.body}>
      <Dropdown
        appendTo={document.body}
        content={
          <Menu
            onClick={(event: MouseEvent) => {
              event.stopPropagation();
            }}>
            <HighFidelityContainer
              lowQualitySettings={lowQualitySettings}
              highQualitySettings={highQualitySettings}
            />
            {customSettingsContent ?? <></>}
          </Menu>
        }
        placement="auto">
        <Button
          ref={ref}
          icon="Settings"
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
