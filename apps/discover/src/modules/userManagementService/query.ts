import { useMutation, useQuery, useQueryClient } from 'react-query';

import {
  UMSUserProfile,
  UMSUserProfilePreferences,
} from '@cognite/user-management-service-types';

import { USER_PREFERENCES_KEY } from 'constants/react-query';
import { getJsonHeaders } from 'modules/api/service';

import { userPreferences } from './endpoints';

export const useUserPreferencesQuery = () => {
  const headers = getJsonHeaders({}, true);

  return useQuery(USER_PREFERENCES_KEY.ME, () =>
    userPreferences(headers).get()
  );
};

export const useUserPreferencesMutate = (key: any) => {
  const headers = getJsonHeaders({}, true);
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
        queryClient.invalidateQueries(USER_PREFERENCES_KEY.ME);
      },
    }
  );
};
