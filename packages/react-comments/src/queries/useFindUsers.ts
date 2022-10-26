import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { UMSUser, UMSUserSearch } from '@cognite/user-management-service-types';
import { AuthHeaders } from '@cognite/react-container';

export const userKeys = {
  all: ['users'] as const,
  users: () => [...userKeys.all, 'user'] as const,
  usersGet: (ids: string[]) => [...userKeys.users(), ...ids] as const,
  userSearch: (query: Props['query']) =>
    [...userKeys.users(), { query }] as const,
};

interface Props {
  headers: AuthHeaders | { fasAppId?: string };
  query?: string;
  userManagementServiceBaseUrl: string;
}

const doFindUsers = ({
  headers,
  userManagementServiceBaseUrl,
  query,
}: Props) => {
  if (!query) {
    return [];
  }

  return axios
    .post<UMSUser[]>(
      `${userManagementServiceBaseUrl}/user/search`,
      {
        query,
      } as UMSUserSearch,
      { headers }
    )
    .then((result) => {
      return result.data;
    });
};

export const useFindUsers = (props: Props) => {
  return useQuery(userKeys.userSearch(props.query), () => doFindUsers(props));
};
