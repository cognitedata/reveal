import * as React from 'react';

import { Drawer } from '@cognite/cogs.js';

import { showSuccessMessage } from 'components/toast';
import { useProjectConfigByKey } from 'hooks/useProjectConfig';
import { UserProfileUpdateQueryData } from 'modules/api/user/types';
import { useUserUpdateMutate } from 'modules/api/user/useUserQuery';

import { UserProfileOverlayFooter } from './UserProfileOvelayFooter';
import { UserProfileOverlayContent } from './UserProfileOverlayContent';

interface Props {
  isOverlayOpened: boolean;
  handleProfileUpdated: () => void;
  onCancel?: () => void;
}

export const UserProfile: React.FC<Props> = ({
  isOverlayOpened,
  handleProfileUpdated,
  onCancel,
}) => {
  const { data: generalConfig } = useProjectConfigByKey('general');

  const mutateUpdateUser = useUserUpdateMutate();

  const updateUserDetails = (user: UserProfileUpdateQueryData) => {
    mutateUpdateUser(user, {
      onSuccess: () => {
        showSuccessMessage('Success');
        handleProfileUpdated();
      },
    });
  };

  return (
    <Drawer
      visible={isOverlayOpened}
      width={330}
      footer={<UserProfileOverlayFooter />}
      closable
      onCancel={onCancel}
      data-testid={`user-profile-${isOverlayOpened ? 'open' : 'close'}`}
    >
      <UserProfileOverlayContent
        companyInfo={generalConfig?.companyInfo}
        updateUserDetails={updateUserDetails}
      />
    </Drawer>
  );
};
