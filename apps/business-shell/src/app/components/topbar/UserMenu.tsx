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
import './UserMenu.css';

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
            <StyledUserMenu>
              <Menu.Header>{t('LABEL_ACCOUNT')}</Menu.Header>
              <UserDetailsMenuItem>
                <Avatar text={name} />
                <Flex direction="column" justifyContent="center">
                  <Body level={2}>{name}</Body>
                  {!!email && (
                    <Body level={2} muted>
                      {email}
                    </Body>
                  )}
                </Flex>
              </UserDetailsMenuItem>
              <Menu.Item
                onClick={() => {
                  navigate('/profile');
                }}
              >
                {t('LABEL_MANAGE_ACCOUNT')}
              </Menu.Item>
              <Divider />
              <Menu.Item icon="Logout" onClick={handleLogout}>
                {t('SIGN_OUT_BTN_TEXT')}
              </Menu.Item>
            </StyledUserMenu>
          ),
        },
      ]}
    />
  );
};

const StyledUserMenu = styled(Menu)`
  min-width: 312px;
  max-width: unset;
`;

const UserDetailsMenuItem = styled.div`
  display: flex;
  gap: 8px;
  padding: 8px;
`;

export default UserMenu;
