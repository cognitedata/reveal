import { Label } from '@cognite/cogs.js';
import {
  mapFiltersToEventsAdvancedFilters,
  mapInternalFilterToEventsFilter,
  useEventsAggregateCountQuery,
} from '@data-exploration-lib/domain-layer';
import { ResourceTypeTitle, TabContainer } from './elements';
import { getTabCountLabel } from '@data-exploration-components/utils';
import { useMemo } from 'react';

type Props = {
  query?: string;
  filter?: any;
  showCount?: boolean;
};

export const EventsTab = ({ query, filter, showCount = false }: Props) => {
  const { data, ...rest } = useEventsAggregateCountQuery(
    { eventsFilters: filter, query },
    { keepPreviousData: true }
  );

  return (
    <TabContainer>
      <ResourceTypeTitle>{'Events'}</ResourceTypeTitle>
      {showCount && (
        <Label size="small" variant="unknown">
          {getTabCountLabel(data?.count || 0)}
        </Label>
      )}
    </TabContainer>
  );
};
