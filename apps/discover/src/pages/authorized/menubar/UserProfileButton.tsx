import React from 'react';

import styled from 'styled-components/macro';

import { TopBar } from '@cognite/cogs.js';

import { CurrentUserAvatar } from 'pages/authorized/user-profile/CurrentUserAvatar';
import { UserProfile } from 'pages/authorized/user-profile/UserProfile';

const TopBarActions = styled(TopBar.Actions)`
  border-right: none;
`;

export const UserProfileButton: React.FC = () => {
  const [userProfileDrawerOpen, setUserProfileDrawerOpen] =
    React.useState(false);

  const closePanel = () => {
    setUserProfileDrawerOpen(false);
  };

  const openPanel = () => {
    setUserProfileDrawerOpen(true);
  };

  return (
    <>
      <TopBarActions
        actions={[
          {
            component: <CurrentUserAvatar key={2} />,
            key: 'userprofile',
            onClick: openPanel,
          },
        ]}
      />

      <UserProfile
        isOverlayOpened={userProfileDrawerOpen}
        onCancel={closePanel}
      />
    </>
  );
};
