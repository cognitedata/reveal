import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { usePrefetchWellFilterOptions } from 'modules/wellSearch/hooks/useWellFilterOptionsQuery';

export const PrefetchFilterOptions: React.FC = () => {
  const usePreferredUnit = useUserPreferencesMeasurement();
  usePrefetchWellFilterOptions(usePreferredUnit);
  return null;
};
