import { useUserPreferencesMeasurement } from 'hooks/useUserPreference';

import { getCasingColumnsWithPrefferedUnit } from '../helper';

export const useGetCasingTableColumns = () =>
  getCasingColumnsWithPrefferedUnit(useUserPreferencesMeasurement());
