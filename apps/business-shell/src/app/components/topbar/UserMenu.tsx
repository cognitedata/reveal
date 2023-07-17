import React from 'react';

import { useAuth } from '@cognite/auth-react';
import { useTypedTranslation as useTranslation } from '@cognite/cdf-i18n-utils';
import { trackEvent } from '@cognite/cdf-route-tracker';
import { Avatar, TopBar as CogsTopBar } from '@cognite/cogs.js';
import { UserMenu as SharedUserMenu } from '@cognite/user-profile-components';

import { useUserInfo } from '../../../hooks/useUserInfo';

import './UserMenu.css';

const UserMenu = (): JSX.Element => {
  const { t } = useTranslation();
  const { logout } = useAuth();

  const { data = {} } = useUserInfo();
  const { name, email, picture: profilePicture } = data;
  const userInfo = { name, email, profilePicture };

  const handleLogout = async () => {
    logout();
  };

  const handleManageAccountClick = () => {
    const { pathname, search } = window.location;
    const project = pathname.split('/')[1];
    const url = `${project}/profile${search}`;
    window.open(url, '_blank');
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
              onManageAccountClick={handleManageAccountClick}
              onLogoutClick={handleLogout}
              menuTitle={t('LABEL_ACCOUNT')}
              menuItemManageAccountBtnText={t('LABEL_MANAGE_ACCOUNT')}
              menuItemLogoutBtnText={t('SIGN_OUT_BTN_TEXT')}
              onTrackEvent={(eventName, metaData) => {
                trackEvent(`BusinessShell.UserMenu.${eventName}`, metaData);
              }}
            />
          ),
        },
      ]}
    />
  );
};

export default UserMenu;
