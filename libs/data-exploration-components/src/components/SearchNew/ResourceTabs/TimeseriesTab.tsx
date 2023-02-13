import React from 'react';
import { Tabs } from '@cognite/cogs.js';
import { useTimeseriesAggregateCountQuery } from '@data-exploration-lib/domain-layer';
import { getTabCountLabel } from '@data-exploration-components/utils';
import { ResourceTabProps } from './types';

export const TimeseriesTab = ({
  query,
  filter,
  showCount = false,
  ...rest
}: ResourceTabProps) => {
  const { data } = useTimeseriesAggregateCountQuery(
    { timeseriesFilters: filter, query },
    { keepPreviousData: true }
  );
  const chipRightProps = showCount
    ? {
        chipRight: {
          label: getTabCountLabel(data?.count || 0),
          size: 'x-small',
        },
      }
    : {};

  return <Tabs.Tab label="Time series" {...chipRightProps} {...rest} />;
};
