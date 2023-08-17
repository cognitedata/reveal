import React from 'react';

import { useTypedTranslation as useTranslation } from '@cognite/cdf-i18n-utils';
import { Avatar, Dropdown } from '@cognite/cogs.js';
import { UserMenu as SharedUserMenu } from '@cognite/user-profile-components';

import { useUserInfo } from '../../../hooks/useUserInfo';
import { useAuthContext } from '../../common/auth/AuthProvider';
import { useTracker } from '../../common/metrics';

import './UserMenu.css';

const UserMenu = (): JSX.Element => {
  const { t } = useTranslation();
  const { logout } = useAuthContext();

  const { data = {} } = useUserInfo();
  const { name, email, picture: profilePicture } = data;
  const userInfo = { name, email, profilePicture };
  const { track } = useTracker();

  const handleLogout = async () => {
    logout();
  };

  return (
    <Dropdown
      content={
        <SharedUserMenu
          userInfo={userInfo}
          onLogoutClick={handleLogout}
          menuTitle={t('LABEL_ACCOUNT')}
          menuItemManageAccountBtnText={t('LABEL_MANAGE_ACCOUNT')}
          menuItemLogoutBtnText={t('SIGN_OUT_BTN_TEXT')}
          onTrackEvent={(eventName, metaData) => {
            track(`BusinessShell.UserMenu.${eventName}`, metaData);
          }}
        />
      }
    >
      <Avatar tooltip={false} text={name} />
    </Dropdown>
  );
};

export default UserMenu;
