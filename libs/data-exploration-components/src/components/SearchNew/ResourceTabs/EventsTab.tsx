import { useEventsAggregateCountQuery } from '@data-exploration-lib/domain-layer';

import { ResourceTabProps } from './types';
import { getChipRightPropsForResourceCounter } from '../../../utils';
import { CounterTab } from './elements';
import { useGetSearchConfigFromLocalStorage } from '@data-exploration-lib/core';

export const EventsTab = ({ query, filter, ...rest }: ResourceTabProps) => {
  const eventSearchConfig = useGetSearchConfigFromLocalStorage('event');
  const { data, isLoading } = useEventsAggregateCountQuery(
    { eventsFilters: filter, query },
    { keepPreviousData: true },
    eventSearchConfig
  );

  const chipRightProps = getChipRightPropsForResourceCounter(
    data?.count || 0,
    isLoading
  );

  return <CounterTab label="Events" {...chipRightProps} {...rest} />;
};
