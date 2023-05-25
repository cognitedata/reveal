import { useEventsAggregateCountQuery } from '@data-exploration-lib/domain-layer';
import { useGetSearchConfigFromLocalStorage } from '@data-exploration-lib/core';
import { getChipRightPropsForResourceCounter } from './getChipRightPropsForResourceCounter';

import { ResourceTabProps } from './types';
import { CounterTab } from './elements';

export const EventsTab = ({ query, filter, ...rest }: ResourceTabProps) => {
  const eventSearchConfig = useGetSearchConfigFromLocalStorage('event');
  const { data, isLoading } = useEventsAggregateCountQuery(
    { eventsFilters: filter, query },
    eventSearchConfig,
    { keepPreviousData: true }
  );

  const chipRightProps = getChipRightPropsForResourceCounter(
    data?.count || 0,
    isLoading
  );

  return <CounterTab label="Events" {...chipRightProps} {...rest} />;
};
