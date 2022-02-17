import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { generateOverviewColumns } from '../utils';

export const useOverviewResultColumns = () => {
  const { data: preferredUnit } = useUserPreferencesMeasurement();
  return generateOverviewColumns(preferredUnit);
};
