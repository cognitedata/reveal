import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@cognite/auth-react';
import { useTypedTranslation as useTranslation } from '@cognite/cdf-i18n-utils';
import { trackEvent } from '@cognite/cdf-route-tracker';
import { Avatar, TopBar as CogsTopBar } from '@cognite/cogs.js';
import { UserMenu as SharedUserMenu } from '@cognite/user-profile-components';

import { useUserInfo } from '../../../hooks/useUserInfo';

import './UserMenu.css';

const UserMenu = (): JSX.Element => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const { data = {} } = useUserInfo();
  const { name, email, picture: profilePicture } = data;
  const userInfo = { name, email, profilePicture };

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
            <SharedUserMenu
              userInfo={userInfo}
              onManageAccountClick={() => navigate('/profile')}
              onLogoutClick={() => handleLogout()}
              menuTitle={t('LABEL_ACCOUNT')}
              menuItemManageAccountBtnText={t('LABEL_MANAGE_ACCOUNT')}
              menuItemLogoutBtnText={t('SIGN_OUT_BTN_TEXT')}
            />
          ),
        },
      ]}
    />
  );
};

export default UserMenu;
