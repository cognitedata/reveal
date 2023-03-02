import { useTimeseriesAggregateCountQuery } from '@data-exploration-lib/domain-layer';
import {
  getChipRightPropsForResourceCounter,
  getTabCountLabel,
} from '../../../utils';

import { ResourceTabProps } from './types';
import { CounterTab } from './elements';

export const TimeseriesTab = ({ query, filter, ...rest }: ResourceTabProps) => {
  const { data, isLoading } = useTimeseriesAggregateCountQuery({
    timeseriesFilters: filter,
    query,
  });
  const chipRightProps = getChipRightPropsForResourceCounter(
    getTabCountLabel(data?.count || 0),
    isLoading
  );

  return <CounterTab label="Time series" {...chipRightProps} {...rest} />;
};
