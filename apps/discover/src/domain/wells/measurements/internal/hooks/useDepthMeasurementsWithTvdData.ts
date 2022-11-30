import { AllCursorsProps } from 'domain/wells/types';

import { EMPTY_ARRAY } from 'constants/empty';
import { useDeepMemo } from 'hooks/useDeep';

import { MeasurementTypeFilter } from '../../service/types';
import { filterMdIndexedDepthMeasurements } from '../selectors/filterMdIndexedDepthMeasurements';

import { useDepthMeasurementsTVD } from './useDepthMeasurementsTVD';
import { useDepthMeasurementsWithData } from './useDepthMeasurementsWithData';

export const useDepthMeasurementsWithTvdData = ({
  wellboreIds,
  measurementTypes,
}: AllCursorsProps & MeasurementTypeFilter) => {
  const { data: initialData, isLoading: isInitialDataLoading } =
    useDepthMeasurementsWithData({
      wellboreIds,
      measurementTypes,
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
        data: EMPTY_ARRAY,
        isLoading: true,
      };
    }

    return {
      data: [...mdIndexedData, ...tvdIndexedData],
      isLoading: false,
    };
  }, [
    mdIndexedData,
    tvdIndexedData,
    isInitialDataLoading,
    isTvdIndexedDataLoading,
  ]);
};
