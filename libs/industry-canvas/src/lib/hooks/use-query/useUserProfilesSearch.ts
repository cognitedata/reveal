import { useQuery } from '@tanstack/react-query';

import { CogniteClient } from '@cognite/sdk/dist/src';
import { useSDK } from '@cognite/sdk-provider';

import { QueryKeys } from '../../constants';
import { UserProfile } from '../../UserProfileProvider';

export const searchUserProfiles = async (
  client: CogniteClient,
  name: string
): Promise<UserProfile[]> => {
  const response = await client.post<{ items: UserProfile[] }>(
    `/api/v1/projects/${client.project}/profiles/search`,
    {
      data: {
        search: { name },
        limit: 5,
      },
    }
  );
  return response.data.items;
};

type Props = {
  name: string;
  isEnabled?: boolean;
};

export const useUserProfilesSearch = ({ name, isEnabled = true }: Props) => {
  const sdk = useSDK();
  const {
    data: userProfiles = [],
    isLoading,
    isError,
  } = useQuery(
    [QueryKeys.USER_PROFILES_SEARCH, name],
    () => searchUserProfiles(sdk, name),
    {
      enabled: isEnabled && name.length > 0,
    }
  );

  return { userProfiles, isLoading, isError };
};
