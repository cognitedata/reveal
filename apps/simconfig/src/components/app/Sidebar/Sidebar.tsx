import { useNavigate } from 'react-location';

import { Drawer } from '@cognite/cogs.js';
import { LogoutButton } from '@cognite/react-container';

import {
  LogOutButtonContainer,
  SettingsContainer,
  SettingsContent,
} from './elements';
import { Footer } from './Footer';

interface SidebarProps {
  isOverlayOpened: boolean;
  onCancel?: () => void;
}

export function Sidebar({ isOverlayOpened, onCancel }: SidebarProps) {
  const navigate = useNavigate();
  return (
    <Drawer
      footer={<Footer />}
      visible={isOverlayOpened}
      width={330}
      closable
      onCancel={onCancel}
    >
      <SettingsContainer>
        <SettingsContent>Here you can put some settings!</SettingsContent>
        <LogOutButtonContainer>
          <LogoutButton
            onClick={() => {
              navigate({ to: '/logout' });
            }}
          />
        </LogOutButtonContainer>
      </SettingsContainer>
    </Drawer>
  );
}
