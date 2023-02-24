import { useEventsAggregateCountQuery } from '@data-exploration-lib/domain-layer';

import { ResourceTabProps } from './types';
import {
  getChipRightPropsForResourceCounter,
  getTabCountLabel,
} from '../../../utils';
import { CounterTab } from './elements';

export const EventsTab = ({
  query,
  filter,
  showCount = false,
  ...rest
}: ResourceTabProps) => {
  const { data, isLoading } = useEventsAggregateCountQuery(
    { eventsFilters: filter, query },
    { keepPreviousData: true }
  );

  const chipRightProps = getChipRightPropsForResourceCounter(
    getTabCountLabel(data?.count || 0),
    showCount,
    isLoading
  );

  return <CounterTab label="Events" {...chipRightProps} {...rest} />;
};
