import { useCasingSchematicsQuery } from 'domain/wells/casings/internal/queries/useCasingSchematicsQuery';
import { useCasingsTvdDataQuery } from 'domain/wells/casings/internal/queries/useCasingsTvdDataQuery';
import { useNdsEventsForCasings } from 'domain/wells/nds/internal/hooks/useNdsEventsForCasings';
import { useWellInspectSelectedWellboreIds } from 'domain/wells/well/internal/transformers/useWellInspectSelectedWellboreIds';
import { useWellInspectSelectedWells } from 'domain/wells/well/internal/transformers/useWellInspectSelectedWells';

import { useMemo } from 'react';

import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { adaptCasingsDataToView } from './utils/adaptCasingsDataToView';

export const useCasingsData = () => {
  const wells = useWellInspectSelectedWells();
  const wellboreIds = useWellInspectSelectedWellboreIds();

  const { data: userPreferredUnit } = useUserPreferencesMeasurement();
  const { data: casingsData, isLoading } = useCasingSchematicsQuery({
    wellboreIds,
  });
  const { data: tvdData } = useCasingsTvdDataQuery(casingsData || []);
  const { data: ndsData } = useNdsEventsForCasings({
    wellboreIds,
  });

  const adaptedCasingsData = useMemo(() => {
    return adaptCasingsDataToView(
      wells,
      casingsData || [],
      tvdData,
      ndsData,
      userPreferredUnit
    );
  }, [wells, casingsData, tvdData, ndsData, userPreferredUnit]);

  return {
    isLoading,
    data: adaptedCasingsData,
  };
};
