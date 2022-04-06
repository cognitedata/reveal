import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from 'react-query';

import { useJsonHeaders } from 'services/service';

import { getTenantInfo } from '@cognite/react-container';
import {
  UMSUser,
  UMSUserProfile,
  UMSUserProfilePreferences,
} from '@cognite/user-management-service-types';

import {
  ONLY_FETCH_ONCE,
  USER_MANAGEMENT_SYSTEM_KEY,
} from 'constants/react-query';

import { MAXIMUM_NUMBER_OF_ADMINS } from './constants';
import { userManagement, userPreferences } from './endpoints';

export const useUserInfo = () => {
  const [project] = getTenantInfo();
  const headers = useJsonHeaders({ 'x-cdp-project': project }, true);

  return useQuery(USER_MANAGEMENT_SYSTEM_KEY.ME, () =>
    userPreferences(headers).get()
  );
};

export const useUpdateMyPreferences = () =>
  useUserPreferencesMutate(USER_MANAGEMENT_SYSTEM_KEY.ME).mutate;

export const useUserPreferencesMutate = (
  key: typeof USER_MANAGEMENT_SYSTEM_KEY[keyof typeof USER_MANAGEMENT_SYSTEM_KEY]
) => {
  const headers = useJsonHeaders({}, true);
  const queryClient = useQueryClient();

  return useMutation(
    (payload: Partial<UMSUserProfilePreferences>) =>
      userPreferences(headers).update(payload),
    {
      onMutate: async (updatedMeasurements) => {
        await queryClient.cancelQueries(key);

        const previousUserPreferences = queryClient.getQueryData(
          key
        ) as UMSUserProfile;

        queryClient.setQueryData<UMSUserProfile | undefined>(
          key,
          (oldPreferences) => {
            if (!oldPreferences) {
              return undefined;
            }
            return {
              ...oldPreferences,
              preferences: {
                ...oldPreferences.preferences,
                ...updatedMeasurements,
              },
            };
          }
        );

        return { previousUserPreferences };
      },
      onError: (_error, _newUserPreferences, context) => {
        const tContext = context as {
          previousUserPreferences: UMSUserProfile | undefined;
        };

        if (tContext.previousUserPreferences) {
          queryClient.setQueryData(key, tContext.previousUserPreferences);
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries(USER_MANAGEMENT_SYSTEM_KEY.ME);
      },
    }
  );
};

export const useAdminUsers = (
  query = ''
): UseQueryResult<UMSUser[] | undefined> => {
  const headers = useJsonHeaders({}, true);
  const queryClient = useQueryClient();

  const { search } = userManagement(headers);

  return useQuery<UMSUser[] | undefined>(
    USER_MANAGEMENT_SYSTEM_KEY.ADMIN_USERS,
    () => search(query, true, MAXIMUM_NUMBER_OF_ADMINS),
    {
      retry: 2,
      ...ONLY_FETCH_ONCE,
      onError: () => {
        queryClient.invalidateQueries(USER_MANAGEMENT_SYSTEM_KEY.ADMIN_USERS);
      },
    }
  );
};
