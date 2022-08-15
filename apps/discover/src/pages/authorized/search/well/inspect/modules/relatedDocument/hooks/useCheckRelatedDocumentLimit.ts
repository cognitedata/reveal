import { LIMIT_WELLBORES_NUMBER } from 'domain/wells/constants';
import { useWellInspectSelectedWellbores } from 'domain/wells/well/internal/hooks/useWellInspectSelectedWellbores';

export const useCheckRelatedDocumentLimit = (): boolean => {
  const wellbores = useWellInspectSelectedWellbores();
  return wellbores.length > LIMIT_WELLBORES_NUMBER;
};
