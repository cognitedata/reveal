import { usePrefetchWellFilterOptions } from 'modules/wellSearch/hooks/useWellFilterOptionsQuery';

export const PrefetchFilterOptions: React.FC = () => {
  usePrefetchWellFilterOptions();
  return null;
};
