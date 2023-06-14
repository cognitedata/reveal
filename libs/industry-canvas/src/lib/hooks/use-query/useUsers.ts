import { useQuery } from '@tanstack/react-query';

import { CogniteClient, HttpError } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { QueryKeys } from '../../constants';

import { UserProfile } from './useUserProfile';

export const getUsers = async (
  client: CogniteClient
): Promise<UserProfile[]> => {
  const response = await client.get<{ items: UserProfile[] }>(
    `/api/v1/projects/${client.project}/profiles`
  );
  return response.data.items;
};

export const useUsers = () => {
  const sdk = useSDK();
  return useQuery<UserProfile[], HttpError>(
    [QueryKeys.USERS],
    async () => await getUsers(sdk),
    {
      retry: (failureCount: number, error: HttpError): boolean => {
        // Retry iff we do *not* get a 403. That is if, and only if,
        // we do have access to the Profiles API
        return error.status !== 403;
      },
    }
  );
};
