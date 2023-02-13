import React from 'react';
import { Tabs } from '@cognite/cogs.js';
import { useEventsAggregateCountQuery } from '@data-exploration-lib/domain-layer';

import { getTabCountLabel } from '@data-exploration-components/utils';
import { ResourceTabProps } from './types';

export const EventsTab = ({
  query,
  filter,
  showCount = false,
  ...rest
}: ResourceTabProps) => {
  const { data } = useEventsAggregateCountQuery(
    { eventsFilters: filter, query },
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

  return <Tabs.Tab label="Events" {...chipRightProps} {...rest} />;
};
