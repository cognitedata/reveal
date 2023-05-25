import { useTimeseriesAggregateCountQuery } from '@data-exploration-lib/domain-layer';
import { useGetSearchConfigFromLocalStorage } from '@data-exploration-lib/core';
import { getChipRightPropsForResourceCounter } from './getChipRightPropsForResourceCounter';

import { ResourceTabProps } from './types';
import { CounterTab } from './elements';

export const TimeseriesTab = ({ query, filter, ...rest }: ResourceTabProps) => {
  const timeseriesSearchConfig =
    useGetSearchConfigFromLocalStorage('timeSeries');
  const { data, isLoading } = useTimeseriesAggregateCountQuery(
    {
      timeseriesFilters: filter,
      query,
    },
    timeseriesSearchConfig
  );
  const chipRightProps = getChipRightPropsForResourceCounter(
    data?.count || 0,
    isLoading
  );

  return <CounterTab label="Time series" {...chipRightProps} {...rest} />;
};
