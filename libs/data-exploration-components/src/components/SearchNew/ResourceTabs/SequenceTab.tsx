import { CounterTab } from './elements';

import { useSequenceSearchAggregateQuery } from '@data-exploration-lib/domain-layer';
import {
  getChipRightPropsForResourceCounter,
  getTabCountLabel,
} from '../../../utils';

import { ResourceTabProps } from './types';

export const SequenceTab = ({
  query,
  filter,
  showCount = false,
  ...rest
}: ResourceTabProps) => {
  const {
    data: { count },
    isLoading,
  } = useSequenceSearchAggregateQuery({
    filter,
    query,
  });

  const chipRightProps = getChipRightPropsForResourceCounter(
    getTabCountLabel(count),
    showCount,
    isLoading
  );

  return <CounterTab label="Sequence" {...chipRightProps} {...rest} />;
};
