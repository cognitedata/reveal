import { useDepthMeasurementsTVD } from 'domain/wells/measurements/internal/hooks/useDepthMeasurementsTVD';
import { useFitLotDepthMeasurements } from 'domain/wells/measurements/internal/hooks/useFitLotDepthMeasurements';
import { filterMdIndexedDepthMeasurements } from 'domain/wells/measurements/internal/selectors/filterMdIndexedDepthMeasurements';
import { DepthMeasurementWithData } from 'domain/wells/measurements/internal/types';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import { EMPTY_ARRAY, EMPTY_OBJECT } from 'constants/empty';
import { useDeepMemo } from 'hooks/useDeep';
import { useWellInspectWellboreIds } from 'modules/wellInspect/selectors';

export const useMeasurementsColumnsData = () => {
  const wellboreIds = useWellInspectWellboreIds();

  const { data: initialData, isLoading: isInitialDataLoading } =
    useFitLotDepthMeasurements({
      wellboreIds,
    });

  const { data: tvdIndexedData, isLoading: isTvdIndexedDataLoading } =
    useDepthMeasurementsTVD(initialData);

  const mdIndexedData = useDeepMemo(() => {
    if (!initialData) {
      return EMPTY_ARRAY;
    }
    return filterMdIndexedDepthMeasurements(initialData);
  }, [initialData]);

  return useDeepMemo(() => {
    if (isInitialDataLoading || isTvdIndexedDataLoading) {
      return {
        data: EMPTY_OBJECT as Record<string, DepthMeasurementWithData[]>,
        isLoading: true,
      };
    }

    return {
      data: groupByWellbore([...mdIndexedData, ...tvdIndexedData]),
      isLoading: false,
    };
  }, [
    mdIndexedData,
    tvdIndexedData,
    isInitialDataLoading,
    isTvdIndexedDataLoading,
  ]);
};
