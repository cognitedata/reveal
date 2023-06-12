import { useQuery } from '@tanstack/react-query';

import sdk from '@cognite/cdf-sdk-singleton';
import { CogniteClient, HttpError } from '@cognite/sdk';

import { QUERY_KEY } from '.';

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
  return useQuery<UserProfile, HttpError>(
    QUERY_KEY.GET_USER_PROFILE(),
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
