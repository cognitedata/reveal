import {
  MutateFunction,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';

import { discoverAPI, useJsonHeaders } from 'services/service';

import { getTenantInfo } from '@cognite/react-container';

import { ONLY_FETCH_ONCE, USER_KEY } from 'constants/react-query';
import { useAccessToken } from 'hooks/useAccessToken';
import { useProjectConfigByKey } from 'hooks/useProjectConfig';
import { AuthModes, User } from 'modules/user/types';

import { UserProfileUpdateQueryData } from './types';

// we sync once on startup to make sure the db-service
// has all the info about this user, eg: admin status (detected from token)
export const useUserSyncQuery = () => {
  const headers = useJsonHeaders({}, true);
  const authToken = useAccessToken();
  const [tenant] = getTenantInfo();

  return useQuery(
    USER_KEY.SYNC_QUERY,
    () => {
      return discoverAPI.user.sync(headers, tenant, authToken);
    },
    {
      retry: 2,
      ...ONLY_FETCH_ONCE,
    }
  );
};

export function useUserProfileQuery(): UseQueryResult<User | undefined> {
  const headers = useJsonHeaders({}, true);
  const [tenant] = getTenantInfo();
  const queryClient = useQueryClient();

  return useQuery<User | undefined>(
    [...USER_KEY.USER],
    () => discoverAPI.user.getUser(headers, tenant),
    {
      retry: 2,
      ...ONLY_FETCH_ONCE,
      onError: () => {
        queryClient.invalidateQueries([...USER_KEY.USER]);
      },
    }
  );
}

export function useUserRoles(): UseQueryResult<AuthModes | undefined> {
  const idHeaders = useJsonHeaders({}, true);
  const headers = useJsonHeaders();
  const [tenant] = getTenantInfo();
  const { data: azureConfig } = useProjectConfigByKey('azureConfig');

  return useQuery<AuthModes | undefined>(
    USER_KEY.ROLES,
    () => {
      if (azureConfig && azureConfig?.enabled) {
        return discoverAPI.user.getRoles(idHeaders, tenant);
      }

      return discoverAPI.user.getRolesLegacy(headers, tenant);
    },
    {
      retry: 2,
      ...ONLY_FETCH_ONCE,
    }
  );
}

// TODO(PP-2319): use this hook to fetch admin users.
// Currently, this giving all users.
export const useAdminUsers = (): UseQueryResult<User[] | undefined> => {
  const headers = useJsonHeaders({}, true);
  const [tenant] = getTenantInfo();
  const queryClient = useQueryClient();

  return useQuery<User[] | undefined>(
    [...USER_KEY.ADMIN_USERS],
    () => discoverAPI.user.getAdminUsers(headers, tenant),
    {
      retry: 2,
      ...ONLY_FETCH_ONCE,
      onError: () => {
        queryClient.invalidateQueries([...USER_KEY.ADMIN_USERS]);
      },
    }
  );
};

export type MutateUpdateUser = MutateFunction<
  unknown,
  unknown,
  UserProfileUpdateQueryData,
  unknown
>;
export function useUserUpdateMutate() {
  const headers = useJsonHeaders();
  const [tenant] = getTenantInfo();
  const queryClient = useQueryClient();

  const { mutate } = useMutation<
    unknown,
    unknown,
    UserProfileUpdateQueryData,
    unknown
  >(
    (payload) => {
      // Snapshot the previous value
      const userData = queryClient.getQueryData<User>([...USER_KEY.USER]);

      // this is an optimistic update, if the update fails the data will be returned to previous value
      queryClient.setQueryData([...USER_KEY.USER], {
        ...userData,
        ...payload.payload,
      });

      return discoverAPI.user.updateUser(payload, headers, tenant);
    },

    {
      onSuccess: () => {
        queryClient.invalidateQueries(USER_KEY.ALL_USERS);
      },
      onSettled: () => {
        queryClient.invalidateQueries([...USER_KEY.USER]);
      },
    }
  );

  return mutate;
}
