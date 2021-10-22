import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { generateOverviewColumns } from '../utils';

export const useOverviewResultColumns = () =>
  generateOverviewColumns(useUserPreferencesMeasurement());
