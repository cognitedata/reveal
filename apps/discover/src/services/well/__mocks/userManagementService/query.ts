import { useMutation, useQuery, useQueryClient } from 'react-query';

import { useJsonHeaders } from 'services/service';

import { getTenantInfo } from '@cognite/react-container';
import {
  UMSUserProfile,
  UMSUserProfilePreferences,
} from '@cognite/user-management-service-types';

import { USER_MANAGEMENT_SYSTEM_KEY } from 'constants/react-query';

import { userPreferences } from './endpoints';

export const useUserPreferencesQuery = () => {
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
