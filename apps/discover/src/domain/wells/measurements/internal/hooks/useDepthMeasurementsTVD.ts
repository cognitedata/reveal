import { useMemo } from 'react';

import compact from 'lodash/compact';

import { DepthIndexTypeEnum } from '@cognite/sdk-wells';

import { EMPTY_ARRAY } from 'constants/empty';
import { useDeepMemo } from 'hooks/useDeep';

import { useDepthMeasurementsTvdDataQuery } from '../queries/useDepthMeasurementsTvdDataQuery';
import { convertToTvdIndexedDepthMeasurement } from '../transformers/convertToTvdIndexedDepthMeasurement';
import { groupByDepthIndexType } from '../transformers/groupByDepthIndexType';
import { DepthMeasurementWithData } from '../types';

export const useDepthMeasurementsTVD = (data: DepthMeasurementWithData[]) => {
  const groupedData = useDeepMemo(() => groupByDepthIndexType(data), [data]);

  const mdIndexedData = useDeepMemo(
    () => groupedData[DepthIndexTypeEnum.MeasuredDepth],
    [groupedData]
  );

  const tvdIndexedData = useDeepMemo(
    () => groupedData[DepthIndexTypeEnum.TrueVerticalDepth],
    [groupedData]
  );

  const { data: tvdData, isLoading } =
    useDepthMeasurementsTvdDataQuery(mdIndexedData);

  return useMemo(() => {
    if (!tvdData || isLoading) {
      return {
        data: EMPTY_ARRAY as DepthMeasurementWithData[],
        isLoading,
      };
    }

    const convertedData: DepthMeasurementWithData[] = compact(
      mdIndexedData.map((depthMeasurement) => {
        const { wellboreMatchingId } = depthMeasurement;
        const wellboreTvdData = tvdData[wellboreMatchingId];

        if (!wellboreTvdData) {
          return null;
        }

        return convertToTvdIndexedDepthMeasurement(
          depthMeasurement,
          wellboreTvdData
        );
      })
    );

    return {
      data: [...tvdIndexedData, ...convertedData],
      isLoading,
    };
  }, [data, tvdData, isLoading]);
};
