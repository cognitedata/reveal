import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { CogniteClient } from '@cognite/sdk';
import { SDKProvider } from '@cognite/sdk-provider';

import { UserProfileProvider } from '../../UserProfileProvider';

import { profilesMe, profilesSearch, selectedUsers, canvas } from './fixtures';
import { UserSearch } from './UserSearch';

export default {
  title: 'Containers/User Search',
  component: UserSearch,
};

const generateMockSdk = () => {
  return {
    get: async (url: string): Promise<any> => {
      if (url.endsWith('/profiles/me')) {
        return {
          data: profilesMe,
        };
      }

      throw new Error('Unmocked SDK Get call');
    },
    post: async (url: string): Promise<any> => {
      if (url.endsWith('/profiles/byids')) {
        return {
          data: {
            items: [profilesMe],
          },
        };
      }
      if (url.endsWith('/profiles/search')) {
        return {
          data: {
            items: profilesSearch,
          },
        };
      }

      throw new Error('Unmocked SDK Post call');
    },
  } as unknown as CogniteClient;
};

const queryClient = new QueryClient();

export const Default = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SDKProvider sdk={generateMockSdk()}>
        <UserProfileProvider>
          <UserSearch
            activeCanvas={canvas}
            selectedUsers={selectedUsers}
            onUserRemoved={(userId) => console.log('user id removed: ', userId)}
            onUserSelected={(user) => console.log('user selected: ', user)}
          />
        </UserProfileProvider>
      </SDKProvider>
    </QueryClientProvider>
  );
};
