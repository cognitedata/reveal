import { useQuery } from '@tanstack/react-query';

import sdk, { getUserInformation } from '@cognite/cdf-sdk-singleton';
import { CogniteClient, HttpError } from '@cognite/sdk/dist/src';

export type UserProfile = {
  userIdentifier: string;
  lastUpdatedTime: number;
  givenName?: string;
  surname?: string;
  email?: string;
  displayName?: string;
  jobTitle?: string;
};

export const useUserInformation = () => {
  return useQuery(['user-info'], async () => await getUserProfile(sdk), {
    retry: (failureCount: number, error: HttpError): boolean => {
      // Retry iff we do *not* get a 403. That is if, and only if,
      // we do have access to the Profiles API
      return error.status !== 403;
    },
  });
};

export const getUserProfile = async (
  client: CogniteClient
): Promise<UserProfile> => {
  const response = await client.get<UserProfile>(
    `/api/v1/projects/${client.project}/profiles/me`
  );
  if (response.status === 403) {
    return {
      ...(await getUserInformation()),
      lastUpdatedTime: Date.now(),
      userIdentifier: 'anonymous',
    };
  }
  const userInfo = await getUserInformation();
  return {
    ...response.data,
    email: response.data.email || userInfo.mail,
  };
};
