import { UserPreferredUnit } from 'constants/units';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { getVisibleWellColumns } from './getVisibleWellColumns';
import { useEnabledWellResultColumnNames } from './useEnabledWellResultColumnNames';

export const useEnabledWellResultColumns = () => {
  const enabledWellColumnNames = useEnabledWellResultColumnNames();
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();
  const visibleWellColumns = getVisibleWellColumns({
    unit: userPreferredUnit || UserPreferredUnit.FEET,
    enabled: enabledWellColumnNames,
  });

  return visibleWellColumns;
};
