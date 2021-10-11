import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import styled from 'styled-components/macro';

import { Dropdown, Menu, TopBar } from '@cognite/cogs.js';
import { useFlag } from '@cognite/react-feature-flags';

import { Admin } from 'components/admin';
import navigation from 'constants/navigation';
import { useTenantConfigByKey } from 'hooks/useTenantConfig';
import { TenantConfig } from 'tenants/types';

const MenuContainer = styled.div``;

interface props {
  PATHNAMES: { [key: string]: number };
  handleNavigation: (navigation: string, path: number) => void;
}

interface AdminMenuItems {
  key: number;
  name: string;
  configKey: string;
  onClick: () => void;
}

export const AdminSettings: React.FC<props> = (props) => {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const layersEnabled = useFlag('DISCOVER_admin_layers');
  const { data: showProjectConfig } =
    useTenantConfigByKey<TenantConfig['showProjectConfig']>(
      'showProjectConfig'
    );

  const { PATHNAMES, handleNavigation } = props;

  const { t } = useTranslation();

  const adminMenuItems: AdminMenuItems[] = [
    {
      key: PATHNAMES['ADMIN/FEEDBACK'],
      name: t('Manage Feedback') as string,
      configKey: 'feedback',
      onClick: () => {
        handleNavigation(
          navigation.ADMIN_FEEDBACK,
          PATHNAMES['ADMIN/FEEDBACK']
        );
      },
    },
    {
      key: PATHNAMES['ADMIN/LAYERS'],
      configKey: 'layers',
      name: t('Manage Layers') as string,
      onClick: () => {
        handleNavigation(navigation.ADMIN_LAYERS, PATHNAMES['ADMIN/LAYERS']);
      },
    },
    {
      key: PATHNAMES['ADMIN/PROJECT_CONFIG'],
      configKey: 'projectConfig',
      name: t('Manage Project Config') as string,
      onClick: () => {
        handleNavigation(
          navigation.ADMIN_PROJECT_CONFIG,
          PATHNAMES['ADMIN/PROJECT_CONFIG']
        );
      },
    },
    // {
    //   key: PATHNAMES['ADMIN/USER'],
    //   name: t('Manage Users') as string,
    //   onClick: () =>
    //     handleNavigation(
    //       navigation.ADMIN_USER_MANAGEMENT,
    //       PATHNAMES['ADMIN/USER']
    //     ),
    // },
  ].filter((item) => {
    if (item.configKey === 'layers') {
      return layersEnabled;
    }
    if (item.configKey === 'projectConfig') {
      return showProjectConfig;
    }

    return true;
  });

  const MenuContent = (
    <MenuContainer>
      {showDropdown && (
        <Menu>
          {adminMenuItems.map((item) => (
            <Menu.Item
              key={item.key}
              onClick={() => {
                item.onClick();
                setShowDropdown(false);
              }}
            >
              {item.name}
            </Menu.Item>
          ))}
        </Menu>
      )}
    </MenuContainer>
  );

  return (
    <Admin>
      <Dropdown content={MenuContent}>
        <TopBar.Action
          onClick={() => {
            setShowDropdown(true);
          }}
          text={t('Admin Settings') as string}
        />
      </Dropdown>
    </Admin>
  );
};
