import { useUserPreferencesQuery } from 'services/well/__mocks/userManagementService/query';

import { UMSUserProfilePreferences } from '@cognite/user-management-service-types';

import { UserPreferredUnit } from 'constants/units';

export const useUserPreferencesMeasurement = () => {
  const queryResult = useUserPreferencesQuery();

  return {
    ...queryResult,
    data: queryResult?.isFetched
      ? mapMeasurementEnumToDiscoverUnit(
          queryResult?.data?.preferences?.measurement ||
            UMSUserProfilePreferences.MeasurementEnum.Feet
        )
      : undefined,
  };
};

export const useUserPreferencesMeasurementByMeasurementEnum = () => {
  const { data } = useUserPreferencesQuery();
  return (
    data?.preferences?.measurement ||
    UMSUserProfilePreferences.MeasurementEnum.Feet
  );
};

const mapMeasurementEnumToDiscoverUnit = (
  fromUnit: UMSUserProfilePreferences.MeasurementEnum
) => {
  switch (fromUnit) {
    case UMSUserProfilePreferences.MeasurementEnum.Feet:
      return UserPreferredUnit.FEET;
    case UMSUserProfilePreferences.MeasurementEnum.Meter:
      return UserPreferredUnit.METER;
    default: {
      throw new Error(`Unit: ${fromUnit}, is not supported`);
    }
  }
};
