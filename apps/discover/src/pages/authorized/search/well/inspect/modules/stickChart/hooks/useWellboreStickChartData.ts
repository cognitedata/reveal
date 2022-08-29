import { ColumnsData } from '../types';
import { getDataWithLoadingStatus } from '../utils/getDataWithLoadingStatus';

import { useCasingsColumnsData } from './useCasingsColumnsData';
import { useFormationColumnsData } from './useFormationColumnsData';
import { useMeasurementsColumnsData } from './useMeasurementsColumnsData';
import { useNdsColumnsData } from './useNdsColumnsData';
import { useNptColumnsData } from './useNptColumnsData';
import { useTrajectoryColumnsData } from './useTrajectoryColumnsData';

export const useWellboreStickChartColumns = () => {
  const formationColumnsData = useFormationColumnsData();
  const casingsColumnsData = useCasingsColumnsData();
  const nptColumnsData = useNptColumnsData();
  const ndsColumnsData = useNdsColumnsData();
  const trajectoryColumnsData = useTrajectoryColumnsData();
  const measurementsColumnsData = useMeasurementsColumnsData();

  return (wellboreMatchingId: string): ColumnsData => ({
    formationColumn: getDataWithLoadingStatus(
      formationColumnsData,
      wellboreMatchingId
    ),
    casingsColumn: getDataWithLoadingStatus(
      casingsColumnsData,
      wellboreMatchingId
    ),
    nptColumn: getDataWithLoadingStatus(nptColumnsData, wellboreMatchingId),
    ndsColumn: getDataWithLoadingStatus(ndsColumnsData, wellboreMatchingId),
    trajectoryColumn: getDataWithLoadingStatus(
      trajectoryColumnsData,
      wellboreMatchingId
    ),
    measurementsColumn: getDataWithLoadingStatus(
      measurementsColumnsData,
      wellboreMatchingId
    ),
  });
};
