import {
  InternalEventsFilters,
  useGetSearchConfigFromLocalStorage,
  useTranslation,
} from '@data-exploration-lib/core';
import { useEventsAggregateCountQuery } from '@data-exploration-lib/domain-layer';

import { CounterTab } from './elements';
import { getChipRightPropsForResourceCounter } from './getChipRightPropsForResourceCounter';
import { ResourceTabProps } from './types';

export const EventsTab = ({
  query,
  filter = {},
  ...rest
}: ResourceTabProps<InternalEventsFilters>) => {
  const { t } = useTranslation();
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

  return (
    <CounterTab label={t('EVENTS', 'Events')} {...chipRightProps} {...rest} />
  );
};
