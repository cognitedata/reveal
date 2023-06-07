import { useGetSearchConfigFromLocalStorage } from '@data-exploration-lib/core';
import { useSequenceSearchAggregateQuery } from '@data-exploration-lib/domain-layer';

import { CounterTab } from './elements';
import { getChipRightPropsForResourceCounter } from './getChipRightPropsForResourceCounter';
import { ResourceTabProps } from './types';

export const SequenceTab = ({ query, filter, ...rest }: ResourceTabProps) => {
  const sequenceSearchConfig = useGetSearchConfigFromLocalStorage('sequence');
  const {
    data: { count },
    isLoading,
  } = useSequenceSearchAggregateQuery(
    {
      filter,
      query,
    },
    sequenceSearchConfig
  );

  const chipRightProps = getChipRightPropsForResourceCounter(count, isLoading);

  return <CounterTab label="Sequence" {...chipRightProps} {...rest} />;
};
