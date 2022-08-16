import { useCasingSchematicsQuery } from 'domain/wells/casings/internal/queries/useCasingSchematicsQuery';
import { useCasingsTvdDataQuery } from 'domain/wells/casings/internal/queries/useCasingsTvdDataQuery';
import { useNdsEventsForCasings } from 'domain/wells/nds/internal/hooks/useNdsEventsForCasings';
import { useNptEventsForCasings } from 'domain/wells/npt/internal/hooks/useNptEventsForCasings';
import { useWellInspectSelectedWellboreIds } from 'domain/wells/well/internal/hooks/useWellInspectSelectedWellboreIds';
import { useWellInspectSelectedWells } from 'domain/wells/well/internal/hooks/useWellInspectSelectedWells';
import { useWellTopsQuery } from 'domain/wells/wellTops/internal/queries/useWellTopsQuery';

import { useMemo } from 'react';

import { adaptCasingsDataToView } from '../utils/adaptCasingsDataToView';

export const useCasingsData = () => {
  const wells = useWellInspectSelectedWells();
  const wellboreIds = useWellInspectSelectedWellboreIds();

  const { data: casingsData, isLoading } = useCasingSchematicsQuery({
    wellboreIds,
  });

  const { data: tvdData } = useCasingsTvdDataQuery(casingsData || []);

  const { data: nptData, isLoading: isNptEventsLoading } =
    useNptEventsForCasings({ wellboreIds });

  const { data: ndsData, isLoading: isNdsEventsLoading } =
    useNdsEventsForCasings({ wellboreIds });

  const { data: wellTopsData, isLoading: isWellTopsLoading } =
    useWellTopsQuery();

  const adaptedCasingsData = useMemo(() => {
    return adaptCasingsDataToView(
      wells,
      casingsData || [],
      tvdData,
      nptData,
      ndsData,
      wellTopsData || []
    );
  }, [wells, casingsData, tvdData, nptData, ndsData, wellTopsData]);

  return {
    data: adaptedCasingsData,
    isLoading,
    isNptEventsLoading,
    isNdsEventsLoading,
    isWellTopsLoading,
  };
};
