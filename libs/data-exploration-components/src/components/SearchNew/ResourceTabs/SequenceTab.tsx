import React from 'react';
import { Tabs } from '@cognite/cogs.js';
import { useSequenceSearchAggregateQuery } from '@data-exploration-lib/domain-layer';

import { getTabCountLabel } from '@data-exploration-components/utils';
import { ResourceTabProps } from './types';

export const SequenceTab = ({
  query,
  filter,
  showCount = false,
  ...rest
}: ResourceTabProps) => {
  const {
    data: { count },
  } = useSequenceSearchAggregateQuery({
    filter,
    query,
  });

  const chipRightProps = showCount
    ? { chipRight: { label: getTabCountLabel(count), size: 'x-small' } }
    : {};

  return <Tabs.Tab label="Sequence" {...chipRightProps} {...rest} />;
};
