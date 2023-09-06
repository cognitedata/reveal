import { useQuery } from '@tanstack/react-query';

import { CogniteClient, HttpError } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

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
  return client
    .get<UserProfile>(`/api/v1/projects/${client.project}/profiles/me`)
    .then((res) => res.data);
};

const RETRY_DELAY_MS = 1000;

export const useUserProfileQuery = () => {
  const sdk = useSDK();
  return useQuery<UserProfile, HttpError>(
    ['user-profile'],
    async () => getUserProfile(sdk),
    {
      retry: (failureCount: number): boolean => {
        // Retry iff we do *not* get a 403. That is if, and only if,
        // we do have access to the Profiles API
        return failureCount < 5;
      },
      retryDelay: () => RETRY_DELAY_MS,
    }
  );
};
