import { useQuery } from '@tanstack/react-query';

import { CogniteClient } from '@cognite/sdk/dist/src';
import { useSDK } from '@cognite/sdk-provider';

import { QueryKeys } from '../../constants';
import { UserIdentifier } from '../../types';

import { UserProfile } from './useUserProfile';

export const getUserProfilesByIds = async (
  client: CogniteClient,
  userIdentifiers: string[]
): Promise<UserProfile[]> => {
  const response = await client.post<{ items: UserProfile[] }>(
    `/api/v1/projects/${client.project}/profiles/byids`,
    {
      data: {
        items: userIdentifiers.map((userIdentifier) => ({ userIdentifier })),
      },
    }
  );
  return response.data.items;
};

export type UseCanvasesWithUserProfilesReturnType = {
  userProfiles: UserProfile[];
  isLoading: boolean;
};

type UseCanvasesWithUserProfilesProps = {
  userIdentifiers: UserIdentifier[];
};

export const useUserProfilesByIds = ({
  userIdentifiers,
}: UseCanvasesWithUserProfilesProps) => {
  const sdk = useSDK();

  const { data: userProfiles = [], isLoading } = useQuery(
    [QueryKeys.USER_PROFILES_BY_IDS, userIdentifiers],
    () => getUserProfilesByIds(sdk, userIdentifiers),
    {
      enabled: userIdentifiers.length > 0,
    }
  );

  return { userProfiles, isLoading };
};
