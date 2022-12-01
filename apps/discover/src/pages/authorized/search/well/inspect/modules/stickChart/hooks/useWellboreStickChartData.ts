import { WellboreStickChartData } from '../types';
import { getDataWithLoadingStatus } from '../utils/getDataWithLoadingStatus';

import { useCasingsData } from './useCasingsData';
import { useFormationsData } from './useFormationsData';
import { useHoleSectionsData } from './useHoleSectionsData';
import { useMeasurementsData } from './useMeasurementsData';
import { useMudWeightData } from './useMudWeightData';
import { useNdsData } from './useNdsData';
import { useNptData } from './useNptData';
import { useRigNames } from './useRigNames';
import { useTrajectoryData } from './useTrajectoryData';

export const useWellboreStickChartData = () => {
  const rigNames = useRigNames();
  const formationsData = useFormationsData();
  const casingsData = useCasingsData();
  const nptData = useNptData();
  const ndsData = useNdsData();
  const trajectoryData = useTrajectoryData();
  const measurementsData = useMeasurementsData();
  const holeSectionsData = useHoleSectionsData();
  const mudWeightData = useMudWeightData();

  return (wellboreMatchingId: string): WellboreStickChartData => ({
    rigNames: rigNames[wellboreMatchingId],
    formationsData: getDataWithLoadingStatus(
      formationsData,
      wellboreMatchingId
    ),
    casingsData: getDataWithLoadingStatus(casingsData, wellboreMatchingId),
    nptData: getDataWithLoadingStatus(nptData, wellboreMatchingId),
    ndsData: getDataWithLoadingStatus(ndsData, wellboreMatchingId),
    trajectoryData: getDataWithLoadingStatus(
      trajectoryData,
      wellboreMatchingId
    ),
    measurementsData: getDataWithLoadingStatus(
      measurementsData,
      wellboreMatchingId
    ),
    holeSectionsData: getDataWithLoadingStatus(
      holeSectionsData,
      wellboreMatchingId
    ),
    mudWeightData: getDataWithLoadingStatus(mudWeightData, wellboreMatchingId),
  });
};
