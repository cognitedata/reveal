import {
  InternalSequenceFilters,
  useGetSearchConfigFromLocalStorage,
  useTranslation,
} from '@data-exploration-lib/core';
import { useSequenceSearchAggregateQuery } from '@data-exploration-lib/domain-layer';

import { CounterTab } from './elements';
import { getChipRightPropsForResourceCounter } from './getChipRightPropsForResourceCounter';
import { ResourceTabProps } from './types';

export const SequenceTab = ({
  query,
  filter = {},
  ...rest
}: ResourceTabProps<InternalSequenceFilters>) => {
  const { t } = useTranslation();
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

  return (
    <CounterTab
      label={t('SEQUENCE', 'Sequence')}
      {...chipRightProps}
      {...rest}
    />
  );
};
