import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { getCasingColumnsWithPrefferedUnit } from '../helper';

export const useGetCasingTableColumns = () =>
  getCasingColumnsWithPrefferedUnit(useUserPreferencesMeasurement());
