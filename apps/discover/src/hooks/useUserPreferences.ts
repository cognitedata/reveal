import { UMSUserProfilePreferences } from '@cognite/user-management-service-types';

import { useUserPreferencesQuery } from 'modules/userManagementService/query';

export const useUserPreferencesMeasurement = (mapToDiscoverUnits = true) => {
  const { data } = useUserPreferencesQuery();
  const unit =
    data?.preferences.measurement ||
    UMSUserProfilePreferences.MeasurementEnum.Feet;
  return mapToDiscoverUnits ? mapMeasurementEnumToDiscoverUnit(unit) : unit;
};

const mapMeasurementEnumToDiscoverUnit = (
  fromUnit: UMSUserProfilePreferences.MeasurementEnum
) => {
  switch (fromUnit) {
    case UMSUserProfilePreferences.MeasurementEnum.Feet:
      return 'ft';
    case UMSUserProfilePreferences.MeasurementEnum.Meter:
      return 'm';
    default: {
      throw new Error(`Unit: ${fromUnit}, is not supported`);
    }
  }
};
