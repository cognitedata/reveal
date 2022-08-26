import { ColumnsData } from '../types';

import { useCasingsColumnsData } from './useCasingsColumnsData';
import { useMeasurementsColumnsData } from './useMeasurementsColumnsData';
import { useNdsColumnsData } from './useNdsColumnsData';
import { useNptColumnsData } from './useNptColumnsData';
import { useTrajectoryColumnsData } from './useTrajectoryColumnsData';

export const useWellboreStickChartColumns = () => {
  const { data: casingsColumns, isLoading: isCasingsColumnsLoading } =
    useCasingsColumnsData();

  const { data: nptColumns, isLoading: isNptColumnsLoading } =
    useNptColumnsData();

  const { data: ndsColumns, isLoading: isNdsColumnsLoading } =
    useNdsColumnsData();

  const { data: trajectoryColumns, isLoading: isTrajectoryColumnsLoading } =
    useTrajectoryColumnsData();

  const { data: measurementsColumns, isLoading: isMeasurementsColumnsLoading } =
    useMeasurementsColumnsData();

  return (wellboreMatchingId: string): ColumnsData => ({
    casingsColumn: {
      data: casingsColumns[wellboreMatchingId],
      isLoading: isCasingsColumnsLoading,
    },
    nptColumn: {
      data: nptColumns[wellboreMatchingId],
      isLoading: isNptColumnsLoading,
    },
    ndsColumn: {
      data: ndsColumns[wellboreMatchingId],
      isLoading: isNdsColumnsLoading,
    },
    trajectoryColumn: {
      data: trajectoryColumns[wellboreMatchingId],
      isLoading: isTrajectoryColumnsLoading,
    },
    measurementsColumn: {
      data: measurementsColumns[wellboreMatchingId],
      isLoading: isMeasurementsColumnsLoading,
    },
  });
};
