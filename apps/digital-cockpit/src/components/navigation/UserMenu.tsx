import { Menu } from '@cognite/cogs.js';
import useTranslation from 'hooks/useTranslation';
import { CdfClient } from 'utils';
import { logout } from 'utils/logout';
import { MenuItemWrapper } from './elements';

type UserMenuProps = {
  email: string;
  client: CdfClient;
  openUploadLogoModal: () => void;
  openAppConfigModal: () => void;
  isAdmin: boolean;
};

const UserMenu = (props: UserMenuProps) => {
  const { email, client, openUploadLogoModal, openAppConfigModal, isAdmin } =
    props;
  const { changeLanguage, availableLanguages, currentLanguage } =
    useTranslation('UserMenu');

  return (
    <MenuItemWrapper>
      <Menu.Header>Settings</Menu.Header>
      <Menu.Submenu
        content={
          <MenuItemWrapper>
            {(availableLanguages || []).map((lang) => (
              <Menu.Item
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
              >
                {lang.name}
              </Menu.Item>
            ))}
          </MenuItemWrapper>
        }
      >
        <span>{currentLanguage?.name}</span>
      </Menu.Submenu>
      <Menu.Item appendIcon="LogOut" onClick={() => logout(client)}>
        Log out
      </Menu.Item>
      <Menu.Item style={{ background: '#FAFAFA', borderRadius: '4px' }}>
        {email}
      </Menu.Item>
      {isAdmin && (
        <>
          <Menu.Divider />
          <Menu.Item appendIcon="Upload" onClick={() => openUploadLogoModal()}>
            Upload customer logo
          </Menu.Item>
          <Menu.Item appendIcon="Settings" onClick={() => openAppConfigModal()}>
            Change configuration
          </Menu.Item>
        </>
      )}
    </MenuItemWrapper>
  );
};

export default UserMenu;
