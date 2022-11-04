import { Menu } from '@cognite/cogs.js';
import useTranslation from 'hooks/useTranslation';
import { CdfClient } from 'utils';
import { logout } from 'utils/logout';

import { MenuItemWrapper } from './elements';

type UserMenuProps = {
  email: string;
  openUploadLogoModal: () => void;
  openAppConfigModal: () => void;
  isAdmin: boolean;
};

const UserMenu = (props: UserMenuProps) => {
  const { email, openUploadLogoModal, openAppConfigModal, isAdmin } = props;

  return (
    <MenuItemWrapper>
      <Menu.Header>Settings</Menu.Header>
      <Menu.Item disabled>Change language</Menu.Item>
      <Menu.Item appendIcon="Logout" onClick={() => logout()}>
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
