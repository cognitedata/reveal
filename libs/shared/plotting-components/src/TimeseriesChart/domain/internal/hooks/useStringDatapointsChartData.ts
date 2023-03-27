import { useMemo } from 'react';

import isEmpty from 'lodash/isEmpty';

import { Data } from '../../../../LineChart';

import { EMPTY_DATA } from '../../../constants';
import { StringDatapointsQuery } from '../../service/types';
import { useTimeseriesStringDatapointsQuery } from '../../service/queries/useTimeseriesStringDatapointsQuery';
import { adaptStringDatapointsToChartData } from '../adapters/adaptStringDatapointsToChartData';

export interface Props {
  query: StringDatapointsQuery;
  enabled?: boolean;
}

export const useStringDatapointsChartData = ({ query, enabled }: Props) => {
  const { data, isLoading } = useTimeseriesStringDatapointsQuery(
    query,
    enabled
  );

  const adaptedData: Data = useMemo(() => {
    if (!data || isEmpty(data)) {
      return EMPTY_DATA;
    }
    return adaptStringDatapointsToChartData(data);
  }, [data]);

  return {
    data: adaptedData,
    isLoading,
  };
};
