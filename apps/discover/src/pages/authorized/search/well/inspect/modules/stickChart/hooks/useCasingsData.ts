import { useCasingSchematicsQuery } from 'domain/wells/casings/internal/queries/useCasingSchematicsQuery';
import { useCasingsTvdDataQuery } from 'domain/wells/casings/internal/queries/useCasingsTvdDataQuery';
import { useFitLotDepthMeasurements } from 'domain/wells/measurements/internal/hooks/useFitLotDepthMeasurements';
import { useNdsEventsForCasings } from 'domain/wells/nds/internal/hooks/useNdsEventsForCasings';
import { useNptEventsForCasings } from 'domain/wells/npt/internal/hooks/useNptEventsForCasings';
import { useTrajectoriesWithData } from 'domain/wells/trajectory/internal/hooks/useTrajectoriesWithData';
import { useWellInspectWells } from 'domain/wells/well/internal/hooks/useWellInspectWells';
import { useWellTopsQuery } from 'domain/wells/wellTops/internal/queries/useWellTopsQuery';

import { useMemo } from 'react';

import { useWellInspectWellboreIds } from 'modules/wellInspect/selectors';

import { adaptCasingsDataToView } from '../utils/adaptCasingsDataToView';

export const useCasingsData = () => {
  const { wells } = useWellInspectWells();
  const wellboreIds = useWellInspectWellboreIds();

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

  const { data: trajectoriesData, isLoading: isTrajectoriesLoading } =
    useTrajectoriesWithData({ wellboreIds });

  const { data: measurementsData, isLoading: isMeasurementsDataLoading } =
    useFitLotDepthMeasurements({
      wellboreIds,
    });

  const adaptedCasingsData = useMemo(() => {
    return adaptCasingsDataToView(
      wells,
      casingsData || [],
      tvdData,
      nptData,
      ndsData,
      wellTopsData || [],
      trajectoriesData,
      measurementsData
    );
  }, [
    wells,
    casingsData,
    tvdData,
    nptData,
    ndsData,
    measurementsData,
    trajectoriesData,
    wellTopsData,
  ]);

  return {
    data: adaptedCasingsData,
    isLoading,
    isNptEventsLoading,
    isNdsEventsLoading,
    isWellTopsLoading,
    isTrajectoriesLoading,
    isMeasurementsDataLoading,
  };
};
