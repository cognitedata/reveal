import { useMemo } from 'react';

import isEmpty from 'lodash/isEmpty';
import keyBy from 'lodash/keyBy';

import { Data } from '../../../../LineChart';
import { EMPTY_DATA } from '../../../constants';
import { DataFetchOptions } from '../../../types';
import { useTimeseriesDatapointsQuery } from '../../service/queries';
import {
  mapToChartData,
  mapToTimeseriesDatapointsQueries,
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

  const { data = [], isInitialLoading: isInitialDatapointsLoading } =
    useTimeseriesDatapointsQuery({
      queries: mapToTimeseriesDatapointsQueries({ query, metadata }),
      enabled: isFetched,
    });

  const metadataById = useMemo(() => {
    return keyBy(metadata, 'id');
  }, [metadata]);

  const chartData: Data[] = useMemo(() => {
    return data.map((item) => {
      const { id, datapoints } = item;

      if (isEmpty(datapoints)) {
        return EMPTY_DATA;
      }

      return mapToChartData({
        datapoints,
        metadata: metadataById[id],
      });
    });
  }, [data, metadataById]);

  return {
    data: chartData,
    metadata,
    isLoading: isInitialMetadataLoading || isInitialDatapointsLoading,
  };
};
