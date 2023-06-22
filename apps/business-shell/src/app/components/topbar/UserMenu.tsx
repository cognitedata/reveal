import React from 'react';
import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import { useAuth } from '@cognite/auth-react';
import { useTypedTranslation as useTranslation } from '@cognite/cdf-i18n-utils';
import { trackEvent } from '@cognite/cdf-route-tracker';
import {
  Avatar,
  Body,
  Divider,
  Flex,
  Menu,
  TopBar as CogsTopBar,
} from '@cognite/cogs.js';

import { useUserInfo } from '../../../hooks/useUserInfo';

const UserMenu = (): JSX.Element => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const { data = {} } = useUserInfo();
  const { name, email } = data;

  const handleLogout = async () => {
    trackEvent('Navigation.Logout.Click');
    logout();
  };

  return (
    <CogsTopBar.Actions
      actions={[
        {
          key: 'help',
          icon: 'Help',
        },
        {
          key: 'avatar',
          component: <Avatar text={name} />,
          menu: (
            <Menu>
              <Menu.Header>
                {t('title-account', { defaultValue: 'Account' })}
              </Menu.Header>
              <UserDetailsMenuItem>
                <Avatar text={name} />
                <Flex direction="column">
                  <Body level={2}>{name}</Body>
                  <Body level={2} muted>
                    {email}
                  </Body>
                </Flex>
              </UserDetailsMenuItem>
              <Menu.Item
                onClick={() => {
                  navigate('/profile');
                }}
              >
                {t('manage-account', { defaultValue: 'Manage Account' })}
              </Menu.Item>
              <Divider />
              <Menu.Item icon="Logout" onClick={handleLogout}>
                {t('button-sign-out', { defaultValue: 'Sign out' })}
              </Menu.Item>
            </Menu>
          ),
        },
      ]}
    />
  );
};

const UserDetailsMenuItem = styled.div`
  display: flex;
  gap: 8px;
  padding: 8px;
`;

export default UserMenu;
