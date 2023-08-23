import { StoryFn } from '@storybook/react';

import { UserProfile } from '../../UserProfileProvider';

import SharedUsersAvatars from './SharedUsersAvatars';

export default {
  title: 'Components/SharedUsersAvatars Story',
  component: SharedUsersAvatars,
};

const users: UserProfile[] = [
  {
    userIdentifier: '1',
    displayName: 'Marvin Reza',
    lastUpdatedTime: +new Date(),
  },
  {
    userIdentifier: '2',
    displayName: 'Henrik Greenbech',
    lastUpdatedTime: +new Date(),
  },
  {
    userIdentifier: '3',
    displayName: 'Poyan Nabati',
    lastUpdatedTime: +new Date(),
  },
  {
    userIdentifier: '12',
    displayName: 'Poyan Nabati',
    lastUpdatedTime: +new Date(),
  },
  {
    userIdentifier: '13',
    displayName: 'Michaela Hansen',
    lastUpdatedTime: +new Date(),
  },
  {
    userIdentifier: '14',
    displayName: 'Nermin Sehic',
    lastUpdatedTime: +new Date(),
  },
  {
    userIdentifier: '15',
    displayName: 'Julianne Kühnel',
    lastUpdatedTime: +new Date(),
  },
];

export const EmptySharedUsersAvatarsStory: StoryFn = () => (
  <SharedUsersAvatars users={[]} />
);

export const OneSharedUsersAvatarsStory: StoryFn = () => (
  <SharedUsersAvatars users={users.slice(0, 1)} />
);

export const ThreeSharedUsersAvatarsStory: StoryFn = () => (
  <SharedUsersAvatars users={users.slice(0, 3)} />
);

export const ManySharedUsersAvatarsStory: StoryFn = () => (
  <SharedUsersAvatars users={users} />
);
