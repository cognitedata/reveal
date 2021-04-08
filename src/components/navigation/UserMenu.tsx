import { Menu } from '@cognite/cogs.js';
import useTranslation from 'hooks/useTranslation';
import React from 'react';
import { CdfClient } from 'utils';
import { logout } from 'utils/logout';

type UserMenuProps = {
  email: string;
  client: CdfClient;
  openUploadLogoModal: () => void;
};

const UserMenu = (props: UserMenuProps) => {
  const { email, client, openUploadLogoModal } = props;
  const {
    changeLanguage,
    availableLanguages,
    currentLanguage,
  } = useTranslation('UserMenu');

  return (
    <Menu>
      <Menu.Header>Settings</Menu.Header>
      <Menu.Item appendIcon="Upload" onClick={() => openUploadLogoModal()}>
        Upload customer logo
      </Menu.Item>
      <Menu.Submenu
        content={
          <Menu>
            {(availableLanguages || []).map((lang) => (
              <Menu.Item
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
              >
                {lang.name}
              </Menu.Item>
            ))}
          </Menu>
        }
      >
        <span>{currentLanguage?.name}</span>
      </Menu.Submenu>
      <Menu.Item appendIcon="LogOut" onClick={() => logout(client)}>
        Log out
      </Menu.Item>
      <Menu.Footer>{email}</Menu.Footer>
    </Menu>
  );
};

export default UserMenu;
