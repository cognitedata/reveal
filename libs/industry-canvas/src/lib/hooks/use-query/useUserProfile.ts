import { useQuery } from '@tanstack/react-query';
import { useSDK } from '@cognite/sdk-provider';
import { CogniteClient, HttpError } from '@cognite/sdk';
import { createContext, useContext } from 'react';
import { QueryKeys } from '../../constants';

export type UserProfile = {
  userIdentifier: string;
  lastUpdatedTime: number;
  givenName?: string;
  surname?: string;
  email?: string;
  displayName?: string;
  jobTitle?: string;
};

export const getUserProfile = async (
  client: CogniteClient
): Promise<UserProfile> => {
  const response = await client.get<UserProfile>(
    `/api/v1/projects/${client.project}/profiles/me`
  );
  return response.data;
};

export const useUserProfile = () => {
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
    }
  );
};

export type UserProfileContextType = {
  userProfile: UserProfile;
};

export const UserProfileContext = createContext<UserProfileContextType>({
  userProfile: {
    userIdentifier: '',
    lastUpdatedTime: Date.now(),
  },
});

export const useUserProfileContext = (): UserProfileContextType =>
  useContext(UserProfileContext);
