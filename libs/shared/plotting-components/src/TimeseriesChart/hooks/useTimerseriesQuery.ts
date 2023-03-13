import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import { getTimeseries } from '../service/getTimeseries';
import { TimeseriesQuery } from '../types';
import { adaptToChartData } from '../utils/adaptToChartData';
import { Data } from '../../LineChart';

export const useTimerseriesQuery = (
  query: TimeseriesQuery
): UseQueryResult<Data> => {
  const sdk = useSDK();

  return useQuery(['timeseries', query], () => {
    return getTimeseries(sdk, query).then(adaptToChartData);
  });
};
