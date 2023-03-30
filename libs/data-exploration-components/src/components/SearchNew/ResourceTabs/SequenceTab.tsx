import { CounterTab } from './elements';

import { useSequenceSearchAggregateQuery } from '@data-exploration-lib/domain-layer';
import { getChipRightPropsForResourceCounter } from '../../../utils';

import { ResourceTabProps } from './types';
import { useGetSearchConfigFromLocalStorage } from '@data-exploration-lib/core';

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
    undefined,
    sequenceSearchConfig
  );

  const chipRightProps = getChipRightPropsForResourceCounter(count, isLoading);

  return <CounterTab label="Sequence" {...chipRightProps} {...rest} />;
};
