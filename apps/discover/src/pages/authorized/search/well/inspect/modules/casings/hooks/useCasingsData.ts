import { useCasingsWithTvdData } from 'domain/wells/casings/internal/hooks/useCasingsWithTvdData';
import { useNdsEventsForCasings } from 'domain/wells/nds/internal/hooks/useNdsEventsForCasings';
import { useNptEventsForCasings } from 'domain/wells/npt/internal/hooks/useNptEventsForCasings';
import { useWellInspectSelectedWells } from 'domain/wells/well/internal/hooks/useWellInspectSelectedWells';

import { useMemo } from 'react';

import { useWellInspectSelectedWellboreIds } from 'modules/wellInspect/selectors';

import { adaptCasingsDataToView } from '../utils/adaptCasingsDataToView';

export const useCasingsData = () => {
  const wells = useWellInspectSelectedWells();
  const wellboreIds = useWellInspectSelectedWellboreIds();

  const { data: casingsData, isLoading } = useCasingsWithTvdData({
    wellboreIds,
  });

  const { data: nptData, isLoading: isNptEventsLoading } =
    useNptEventsForCasings({ wellboreIds });

  const { data: ndsData, isLoading: isNdsEventsLoading } =
    useNdsEventsForCasings({ wellboreIds });

  const adaptedCasingsData = useMemo(() => {
    return adaptCasingsDataToView(wells, casingsData, nptData, ndsData);
  }, [wells, casingsData, nptData, ndsData]);

  return {
    data: adaptedCasingsData,
    isLoading,
    isNptEventsLoading,
    isNdsEventsLoading,
  };
};
