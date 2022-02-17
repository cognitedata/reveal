import React from 'react';
import { useTranslation } from 'react-i18next';

import { useUpdateMyPreferences } from 'services/well/__mocks/userManagementService/query';

import { Dropdown, Title, Menu, TopBar, Icon } from '@cognite/cogs.js';
import { UMSUserProfilePreferences } from '@cognite/user-management-service-types';

import { Content, SettingsContent, SettingsHeader } from './elements';
import { MeasurementSetting } from './settings';

export const UserSettings: React.FC = () => {
  const { t } = useTranslation();
  const updatePreferences = useUpdateMyPreferences();

  const [visible, setVisible] = React.useState(false);
  const toggleVisibility = () => setVisible((prevState) => !prevState);

  const handleTabClick = (
    nextTab: string,
    field: keyof UMSUserProfilePreferences
  ) => {
    updatePreferences({
      [field]: nextTab,
    });
  };

  const MenuContent = (
    <Content>
      <Menu>
        <SettingsHeader>
          <Title level={5}>{t('Settings')}</Title>
          <Icon type="CloseLarge" onClick={toggleVisibility} />
        </SettingsHeader>

        <Menu.Divider />

        <SettingsContent>
          <MeasurementSetting onTabClick={handleTabClick} />
        </SettingsContent>
      </Menu>
    </Content>
  );

  return (
    <Dropdown
      content={MenuContent}
      visible={visible}
      onClickOutside={toggleVisibility}
    >
      <TopBar.Action
        icon="Settings"
        aria-label="Settings"
        onClick={toggleVisibility}
      />
    </Dropdown>
  );
};
