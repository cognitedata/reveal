import * as React from 'react';
import { Drawer } from '@cognite/cogs.js';
import { useHistory } from 'react-router-dom';
import { LogoutButton } from '@cognite/react-container';

import { Footer } from './Footer';
import {
  SettingsContent,
  LogOutButtonContainer,
  SettingsContainer,
} from './elements';

interface Props {
  isOverlayOpened: boolean;
  onCancel?: () => void;
}

export const Sidebar: React.FC<Props> = ({ isOverlayOpened, onCancel }) => {
  const history = useHistory();
  const handleClick = () => {
    history.push('/logout');
  };
  return (
    <Drawer
      visible={isOverlayOpened}
      width={330}
      footer={<Footer />}
      closable
      onCancel={onCancel}
    >
      <SettingsContainer>
        <SettingsContent>Here you can put some settings!</SettingsContent>
        <LogOutButtonContainer>
          <LogoutButton handleClick={handleClick} />
        </LogOutButtonContainer>
      </SettingsContainer>
    </Drawer>
  );
};
