import { createContext, useContext } from 'react';

import styled from 'styled-components';

import { useQuery } from '@tanstack/react-query';

import { Colors, Icon } from '@cognite/cogs.js';
import { CogniteClient, HttpError } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { NoAccessPage } from './components/NoAccessPage';
import { QueryKeys } from './constants';

export type UserProfile = {
  userIdentifier: string;
  lastUpdatedTime: number;
  givenName?: string;
  surname?: string;
  email?: string;
  displayName?: string;
  jobTitle?: string;
  pictureUrl?: string;
};

const getUserProfile = async (client: CogniteClient): Promise<UserProfile> => {
  const response = await client.get<UserProfile>(
    `/api/v1/projects/${client.project}/profiles/me`
  );
  return response.data;
};

const RETRY_DELAY_MS = 1000;
const useUserProfileQuery = () => {
  const sdk = useSDK();
  return useQuery<UserProfile, HttpError>(
    [QueryKeys.USER_PROFILE],
    async () => await getUserProfile(sdk),
    {
      retry: (failureCount: number, error: HttpError): boolean => {
        // Retry iff we do *not* get a 403. That is if, and only if,
        // we do have access to the Profiles API
        return error.status !== 403;
      },
      retryDelay: () => RETRY_DELAY_MS,
    }
  );
};

type UserProfileContextType = {
  userProfile: UserProfile;
};

const UserProfileContext = createContext<UserProfileContextType>({
  userProfile: {
    userIdentifier: '',
    lastUpdatedTime: Date.now(),
  },
});

export const UserProfileProvider = ({
  children,
}: {
  children: JSX.Element;
}) => {
  const {
    data: userProfile,
    isLoading: isLoadingUserProfile,
    error: userProfileError,
  } = useUserProfileQuery();

  if (isLoadingUserProfile) {
    return (
      <LoaderWrapper>
        <Icon type="Loader" />
      </LoaderWrapper>
    );
  }

  if (userProfileError?.status === 403) {
    return <NoAccessPage />;
  }

  if (userProfile === undefined) {
    return (
      <NoAccessPage isUserProfileApiActivated={userProfile !== undefined} />
    );
  }

  return (
    <UserProfileContext.Provider value={{ userProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = (): UserProfileContextType =>
  useContext(UserProfileContext);

const LoaderWrapper = styled.div`
  height: 100%;
  width: 100%;
  justify-content: center;
  display: flex;
  align-items: center;
  color: ${Colors['decorative--grayscale--400']};

  svg {
    width: 100%;
    height: 100%;
    width: 36px;
    height: 36px;
  }
`;
