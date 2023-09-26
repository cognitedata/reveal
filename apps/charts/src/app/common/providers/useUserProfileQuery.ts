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

const RETRY_DELAY_MS = 300;
const NUMBER_OF_RETRIES = 10;

export const useUserProfileQuery = () => {
  const sdk = useSDK();
  return useQuery<UserProfile, HttpError>(
    ['user-profile'],
    async () => getUserProfile(sdk),
    {
      retry: (failureCount: number): boolean => {
        return failureCount < NUMBER_OF_RETRIES;
      },
      retryDelay: () => RETRY_DELAY_MS,
    }
  );
};
