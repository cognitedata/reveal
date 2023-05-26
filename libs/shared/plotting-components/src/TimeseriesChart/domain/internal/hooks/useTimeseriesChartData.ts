import { useMemo } from 'react';

import isEmpty from 'lodash/isEmpty';

import { Data } from '../../../../LineChart';
import { EMPTY_DATA } from '../../../constants';
import { DataFetchOptions } from '../../../types';
import { useTimeseriesDatapointsQuery } from '../../service/queries';
import {
  mapToChartData,
  mapToTimeseriesDatapointsQuery,
} from '../transformers';
import { TimeseriesChartQuery } from '../types';

import { useTimeseriesChartMetadata } from './useTimeseriesChartMetadata';

interface Props {
  query: TimeseriesChartQuery;
  dataFetchOptions?: DataFetchOptions;
}

export const useTimeseriesChartData = ({ query, dataFetchOptions }: Props) => {
  const {
    data: metadata,
    isFetched,
    isInitialLoading: isInitialMetadataLoading,
  } = useTimeseriesChartMetadata({
    query,
    dataFetchOptions,
  });

  const { data: datapoints, isInitialLoading: isInitialDatapointsLoading } =
    useTimeseriesDatapointsQuery({
      query: mapToTimeseriesDatapointsQuery({ query, metadata }),
      enabled: isFetched,
    });

  const chartData: Data = useMemo(() => {
    if (!datapoints || isEmpty(datapoints)) {
      return EMPTY_DATA;
    }
    return mapToChartData({ datapoints, metadata });
  }, [datapoints, metadata]);

  return {
    data: chartData,
    metadata,
    isLoading: isInitialMetadataLoading || isInitialDatapointsLoading,
  };
};
