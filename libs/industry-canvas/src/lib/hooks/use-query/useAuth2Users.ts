import { useQuery } from '@tanstack/react-query';

import sdk from '@cognite/cdf-sdk-singleton';
import { getOrganization } from '@cognite/cdf-utilities';

import { QueryKeys, AUTH2_API_URL } from '../../constants';
import { OrganizationUserProfile } from '../../types';
import { UserProfile } from '../../UserProfileProvider';

export const getOrganizationUsers = async (): Promise<
  OrganizationUserProfile[]
> => {
  const organization = getOrganization();
  const url = `${AUTH2_API_URL}/api/v0/orgs/${organization}/users`;

  const response = await sdk.get<OrganizationUserProfile[]>(url);

  return response.data;
};

type Props = {
  name: string;
  isEnabled?: boolean;
};

export const useAuth2Users = ({ name, isEnabled = false }: Props) => {
  const { data, isLoading, isError } = useQuery(
    [QueryKeys.AUTH2_USERS],
    () => getOrganizationUsers(),
    {
      enabled: isEnabled,
    }
  );

  // Until we have a proper 'search' endpoint, use below code to filter according to name input.
  const filteredData =
    data !== undefined
      ? data.reduce((acc: OrganizationUserProfile[], user) => {
          if (user.name.toLowerCase().includes(name.toLowerCase()))
            return [...acc, user];
          return acc;
        }, [])
      : [];

  // Convert new api data model to UserProfile here
  const userProfiles: UserProfile[] = filteredData.map((user) => {
    return {
      userIdentifier: user.id,
      lastUpdatedTime: -1, // new api doesn't have that info yet, so used a dummy value.
      displayName: user.name,
      email: user.email,
      pictureUrl: user.pictureUrl,
    } as UserProfile;
  });

  return { orgUsers: userProfiles, isLoading, isError };
};
