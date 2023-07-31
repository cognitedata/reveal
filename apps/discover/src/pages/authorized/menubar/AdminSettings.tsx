import React, { useState } from 'react';
import { useLocation } from 'react-router-dom-v5';

import styled from 'styled-components/macro';

import { Dropdown, Menu, TopBar } from '@cognite/cogs.js';

import { Admin } from 'components/Admin';
import { SIDECAR } from 'constants/app';
import navigation from 'constants/navigation';
import { useProjectConfigByKey } from 'hooks/useProjectConfig';
import { useTranslation } from 'hooks/useTranslation';

import {
  adminMenuMap,
  ADMIN_CODE_DEFINITIONS_LINK_TEXT_KEY,
  ADMIN_FEEDBACK_LINK_TEXT_KEY,
  ADMIN_PROJECT_CONFIG_LINK_TEXT_KEY,
  ADMIN_MAP_CONFIG,
  PATHNAMES,
} from './constants';

const MenuContainer = styled.div``;

interface Props {
  activeTab: number;
  handleNavigation: (navigation: string, path: number) => void;
}

interface AdminMenuItems {
  key: string;
  name: string;
  disabled?: boolean;
  configKey: string;
  onClick: () => void;
}

const getActiveAdminMenuName = (pathname: string) => {
  const [, text] = Object.entries(adminMenuMap).find(([url]) => {
    return pathname.toLocaleLowerCase().includes(`${url.toLocaleLowerCase()}`);
  }) || [undefined, 'Admin Settings'];

  return text;
};

export const AdminSettings: React.FC<Props> = ({
  activeTab,
  handleNavigation,
}) => {
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const { data: generalConfig } = useProjectConfigByKey('general');

  const { pathname } = useLocation();

  const { t } = useTranslation();

  const adminMenuItems: AdminMenuItems[] = [
    {
      key: 'ADMIN/FEEDBACK',
      name: t(ADMIN_FEEDBACK_LINK_TEXT_KEY) as string,
      configKey: 'feedback',
      onClick: () => {
        handleNavigation(navigation.ADMIN_FEEDBACK, PATHNAMES.ADMIN);
      },
    },
    {
      key: 'ADMIN/PROJECT_CONFIG',
      configKey: 'projectConfig',
      name: t(ADMIN_PROJECT_CONFIG_LINK_TEXT_KEY) as string,
      onClick: () => {
        handleNavigation(navigation.ADMIN_PROJECT_CONFIG, PATHNAMES.ADMIN);
      },
    },
    {
      key: 'ADMIN/CODE_DEFINITIONS',
      configKey: 'projectConfig',
      name: t(ADMIN_CODE_DEFINITIONS_LINK_TEXT_KEY) as string,
      onClick: () => {
        handleNavigation(navigation.ADMIN_LEGEND, PATHNAMES.ADMIN);
      },
    },
    {
      key: 'ADMIN/MAP_CONFIG',
      configKey: 'projectConfig',
      disabled: !SIDECAR.useFDMConfig,
      name: t(ADMIN_MAP_CONFIG) as string,
      onClick: () => {
        handleNavigation(navigation.ADMIN_MAP_CONFIG, PATHNAMES.ADMIN);
      },
    },
  ].filter((item) => {
    if (item.disabled) {
      return false;
    }
    if (item.configKey === 'projectConfig') {
      return generalConfig?.showProjectConfig;
    }

    return true;
  });

  const MenuContent = (
    <MenuContainer>
      <Menu>
        {adminMenuItems.map((item) => (
          <Menu.Item
            key={item.key}
            onClick={() => {
              item.onClick();
              setShowDropdown(false);
            }}
            data-testid={item.key}
          >
            {item.name}
          </Menu.Item>
        ))}
      </Menu>
    </MenuContainer>
  );

  const name = getActiveAdminMenuName(pathname);

  return (
    <Admin>
      <Dropdown
        visible={showDropdown}
        content={MenuContent}
        appendTo={document.body}
        onClickOutside={() => setShowDropdown(false)}
      >
        <TopBar.Navigation
          className="topbar-navigation-padding-fix"
          links={[
            {
              name,
              isActive: activeTab === PATHNAMES.ADMIN,
              onClick: () => setShowDropdown(true),
            },
          ]}
        />
      </Dropdown>
    </Admin>
  );
};
