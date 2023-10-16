import {
  InternalTimeseriesFilters,
  useGetSearchConfigFromLocalStorage,
  useTranslation,
} from '@data-exploration-lib/core';
import { useTimeseriesAggregateCountQuery } from '@data-exploration-lib/domain-layer';

import { CounterTab } from './elements';
import { getChipRightPropsForResourceCounter } from './getChipRightPropsForResourceCounter';
import { ResourceTabProps } from './types';

export const TimeseriesTab = ({
  query,
  filter = {},
  ...rest
}: ResourceTabProps<InternalTimeseriesFilters>) => {
  const timeseriesSearchConfig =
    useGetSearchConfigFromLocalStorage('timeSeries');
  const { t } = useTranslation();

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

  return (
    <CounterTab
      label={t('TIMESERIES', 'Time series')}
      {...chipRightProps}
      {...rest}
    />
  );
};
