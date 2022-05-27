import { useUserInfoQuery } from 'domain/userManagementService/internal/queries/useUserInfoQuery';

import { UMSUserProfilePreferences } from '@cognite/user-management-service-types';

import { UserPreferredUnit } from 'constants/units';

export const useUserPreferencesMeasurement = () => {
  const queryResult = useUserInfoQuery();
  return {
    ...queryResult,
    data: queryResult?.isFetched
      ? mapMeasurementEnumToDiscoverUnit(
          queryResult?.data?.preferences?.measurement ||
            UMSUserProfilePreferences.MeasurementEnum.Feet
        )
      : UserPreferredUnit.FEET,
  };
};

export const useUserPreferencesMeasurementByMeasurementEnum = () => {
  const { data } = useUserInfoQuery();
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
