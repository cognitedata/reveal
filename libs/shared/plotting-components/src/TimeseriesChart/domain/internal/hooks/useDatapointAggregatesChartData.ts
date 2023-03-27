import { useMemo } from 'react';

import isEmpty from 'lodash/isEmpty';

import { Data } from '../../../../LineChart';

import { EMPTY_DATA } from '../../../constants';
import { DatapointAggregatesQuery } from '../../service/types';
import { useTimeseriesDatapointAggregatesQuery } from '../../service/queries/useTimeseriesDatapointAggregatesQuery';
import { adaptDatapointAggregatesToChartData } from '../adapters/adaptDatapointAggregatesToChartData';

export interface Props {
  query: DatapointAggregatesQuery;
  enabled?: boolean;
}

export const useDatapointAggregatesChartData = ({ query, enabled }: Props) => {
  const { data, isLoading } = useTimeseriesDatapointAggregatesQuery(
    query,
    enabled
  );

  const adaptedData: Data = useMemo(() => {
    if (!data || isEmpty(data)) {
      return EMPTY_DATA;
    }
    return adaptDatapointAggregatesToChartData(data);
  }, [data]);

  return {
    data: adaptedData,
    isLoading,
  };
};
