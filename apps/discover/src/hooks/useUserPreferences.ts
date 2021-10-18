import { UMSUserProfilePreferences } from '@cognite/user-management-service-types';

import { useUserPreferencesQuery } from 'modules/userManagementService/query';

export const useUserPreferencesMeasurement =
  (): UMSUserProfilePreferences.MeasurementEnum => {
    const { data } = useUserPreferencesQuery();
    return data?.preferences.measurement || 'feet';
  };
