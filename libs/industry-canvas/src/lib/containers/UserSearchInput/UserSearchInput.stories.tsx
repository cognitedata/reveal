import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { CogniteClient } from '@cognite/sdk';
import { SDKProvider } from '@cognite/sdk-provider';

import { UserProfile } from '../../UserProfileProvider';
import { profilesSearch } from '../UserSearch/fixtures';

import { UserSearchInput } from './UserSearchInput';

export default {
  title: 'Containers/User Search Input',
  component: UserSearchInput,
};

const generateMockSdk = () => {
  return {
    post: async (): Promise<{ data: { items: UserProfile[] } }> => {
      return {
        data: {
          items: profilesSearch,
        },
      };
    },
  } as unknown as CogniteClient;
};

const queryClient = new QueryClient();

export const Default = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SDKProvider sdk={generateMockSdk()}>
        <UserSearchInput
          onUserSelected={(user) => console.log('user selected: ', user)}
        />
      </SDKProvider>
    </QueryClientProvider>
  );
};

export const WithPlaceholder = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SDKProvider sdk={generateMockSdk()}>
        <UserSearchInput
          onUserSelected={(user) => console.log('user selected: ', user)}
          placeholder="This is a custom placeholder for search area..."
        />
      </SDKProvider>
    </QueryClientProvider>
  );
};
