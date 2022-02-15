import { useUserPreferencesQuery } from 'services/userManagementService/query';

import { UMSUserProfilePreferences } from '@cognite/user-management-service-types';

import { UserPrefferedUnit } from 'constants/units';

export const useUserPreferencesMeasurement = () => {
  const { data } = useUserPreferencesQuery();
  const unit =
    data?.preferences?.measurement ||
    UMSUserProfilePreferences.MeasurementEnum.Feet;
  return mapMeasurementEnumToDiscoverUnit(unit);
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
      return UserPrefferedUnit.FEET;
    case UMSUserProfilePreferences.MeasurementEnum.Meter:
      return UserPrefferedUnit.METER;
    default: {
      throw new Error(`Unit: ${fromUnit}, is not supported`);
    }
  }
};
