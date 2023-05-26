import { useGetSearchConfigFromLocalStorage } from '@data-exploration-lib/core';
import { useEventsAggregateCountQuery } from '@data-exploration-lib/domain-layer';

import { CounterTab } from './elements';
import { getChipRightPropsForResourceCounter } from './getChipRightPropsForResourceCounter';
import { ResourceTabProps } from './types';

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
