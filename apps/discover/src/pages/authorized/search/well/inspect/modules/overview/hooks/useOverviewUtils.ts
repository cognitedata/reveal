import { useUserPreferencesMeasurement } from 'hooks/useUserPreference';

import { generateOverviewColumns } from '../utils';

export const useOverviewResultColumns = () =>
  generateOverviewColumns(useUserPreferencesMeasurement());
