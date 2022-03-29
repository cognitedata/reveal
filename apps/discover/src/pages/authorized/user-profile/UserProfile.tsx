import * as React from 'react';

import { Drawer } from '@cognite/cogs.js';

import { useProjectConfigByKey } from 'hooks/useProjectConfig';

import { UserProfileOverlayFooter } from './UserProfileOvelayFooter';
import { UserProfileOverlayContent } from './UserProfileOverlayContent';

interface Props {
  isOverlayOpened: boolean;
  onCancel?: () => void;
}

export const UserProfile: React.FC<Props> = ({ isOverlayOpened, onCancel }) => {
  const { data: generalConfig } = useProjectConfigByKey('general');

  return (
    <Drawer
      visible={isOverlayOpened}
      width={330}
      footer={<UserProfileOverlayFooter />}
      closable
      onCancel={onCancel}
      data-testid={`user-profile-${isOverlayOpened ? 'open' : 'close'}`}
    >
      <UserProfileOverlayContent companyInfo={generalConfig?.companyInfo} />
    </Drawer>
  );
};
