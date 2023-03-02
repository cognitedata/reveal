import { CounterTab } from './elements';

import { useSequenceSearchAggregateQuery } from '@data-exploration-lib/domain-layer';
import {
  getChipRightPropsForResourceCounter,
  getTabCountLabel,
} from '../../../utils';

import { ResourceTabProps } from './types';

export const SequenceTab = ({ query, filter, ...rest }: ResourceTabProps) => {
  const {
    data: { count },
    isLoading,
  } = useSequenceSearchAggregateQuery({
    filter,
    query,
  });

  const chipRightProps = getChipRightPropsForResourceCounter(
    getTabCountLabel(count),
    isLoading
  );

  return <CounterTab label="Sequence" {...chipRightProps} {...rest} />;
};
