import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { Dropdown, Title, Menu, TopBar } from '@cognite/cogs.js';
import { UMSUserProfilePreferences } from '@cognite/user-management-service-types';

import { USER_PREFERENCES_KEY } from 'constants/react-query';
import { useUserPreferencesMutate } from 'modules/userManagementService/query';

import { Content, SettingsContent, SettingsHeader } from './elements';
import { MeasurementSetting } from './settings';

export const UserSettings: React.FC = () => {
  const { t } = useTranslation();
  const { mutate } = useUserPreferencesMutate(USER_PREFERENCES_KEY.ME);

  const handleTabClick = (
    nextTab: string,
    field: keyof UMSUserProfilePreferences
  ) => {
    mutate({
      [field]: nextTab,
    });
  };

  const MenuContent = (
    <Content>
      <Menu>
        <SettingsHeader>
          <Title level={5}>{t('Settings')}</Title>
        </SettingsHeader>

        <Menu.Divider />

        <SettingsContent>
          <MeasurementSetting onTabClick={handleTabClick} />
        </SettingsContent>
      </Menu>
    </Content>
  );

  return (
    <Dropdown content={MenuContent}>
      <TopBar.Action icon="Settings" aria-label="Settings" />
    </Dropdown>
  );
};
