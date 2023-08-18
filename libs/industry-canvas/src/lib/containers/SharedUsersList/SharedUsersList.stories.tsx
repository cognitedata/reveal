import React from 'react';

import { profilesMe, selectedUsers } from '../UserSearch/fixtures';

import { SharedUsersList } from './SharedUsersList';

export default {
  title: 'Containers/Shared Users List',
  component: SharedUsersList,
};

export const Default = () => {
  return (
    <SharedUsersList
      sharedUsers={selectedUsers}
      onUserRemoved={(id) => console.log('user is removed; id: ', id)}
    />
  );
};

export const WithOwner = () => {
  return (
    <SharedUsersList
      ownerProfile={profilesMe}
      sharedUsers={selectedUsers}
      onUserRemoved={(id) => console.log('user is removed; id: ', id)}
    />
  );
};

export const SmallAvatar = () => {
  return (
    <SharedUsersList
      ownerProfile={profilesMe}
      sharedUsers={selectedUsers}
      onUserRemoved={(id) => console.log('user is removed; id: ', id)}
      size="small"
    />
  );
};
