import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { getVisibleWellColumns } from './getVisibleWellColumns';
import { useEnabledWellResultColumnNames } from './useEnabledWellResultColumnNames';

export const useEnabledWellResultColumns = () => {
  const enabledWellColumnNames = useEnabledWellResultColumnNames();
  const userPreferredUnit = useUserPreferencesMeasurement();
  const visibleWellColumns = getVisibleWellColumns({
    unit: userPreferredUnit,
    enabled: enabledWellColumnNames,
  });

  return visibleWellColumns;
};
