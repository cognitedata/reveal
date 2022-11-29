import React from 'react';
import { Label } from '@cognite/cogs.js';
import { useEventsSearchAggregateQuery } from 'domain/events';
import { ResourceTypeTitle, TabContainer } from './elements';

type Props = {
  query?: string;
  filter?: any;
  showCount?: boolean;
};

export const EventsTab = ({ query, filter, showCount = false }: Props) => {
  const {
    data: { count },
  } = useEventsSearchAggregateQuery({
    eventsFilters: filter,
    query,
  });

  return (
    <TabContainer>
      <ResourceTypeTitle>{'Events'}</ResourceTypeTitle>
      {showCount && (
        <Label size="small" variant="unknown">
          {`${count}`}
        </Label>
      )}
    </TabContainer>
  );
};
