import React from 'react';
import { Label } from '@cognite/cogs.js';
import { useTimeseriesAggregateCountQuery } from '@data-exploration-lib/domain-layer';
import { ResourceTypeTitle, TabContainer } from './elements';
import { getTabCountLabel } from '@data-exploration-components/utils';

type Props = {
  query?: string;
  filter?: any;
  showCount?: boolean;
};

export const TimeseriesTab = ({ query, filter, showCount = false }: Props) => {
  const { data, ...rest } = useTimeseriesAggregateCountQuery(
    { timeseriesFilters: filter, query },
    { keepPreviousData: true }
  );

  return (
    <TabContainer>
      <ResourceTypeTitle>{'Time series'}</ResourceTypeTitle>
      {showCount && (
        <Label size="small" variant="unknown">
          {getTabCountLabel(data?.count || 0)}
        </Label>
      )}
    </TabContainer>
  );
};
