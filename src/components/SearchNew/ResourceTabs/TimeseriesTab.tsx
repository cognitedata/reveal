import React from 'react';
import { Label } from '@cognite/cogs.js';
import { useTimeseriesSearchAggregateQuery } from 'domain/timeseries';
import { ResourceTypeTitle, TabContainer } from './elements';

type Props = {
  query?: string;
  filter?: any;
  showCount?: boolean;
};

export const TimeseriesTab = ({ query, filter, showCount = false }: Props) => {
  const {
    data: { count },
  } = useTimeseriesSearchAggregateQuery({
    filter,
    query,
  });

  return (
    <TabContainer>
      <ResourceTypeTitle>{'Time series'}</ResourceTypeTitle>
      {showCount && (
        <Label size="small" variant="unknown">
          {count}
        </Label>
      )}
    </TabContainer>
  );
};
