import React, { useMemo } from 'react';

import { useFilterDataNpt } from 'modules/filterData/selectors';
import { NPTEvent } from 'modules/wellSearch/types';
import { getFilteredNPTEvents } from 'modules/wellSearch/utils/events';

import { NptWellsTable } from './NptWellsTable';

export const NPTTable: React.FC<{ events: NPTEvent[] }> = React.memo(
  ({ events }) => {
    const filterDataNpt = useFilterDataNpt();

    const filteredEvents = useMemo(
      () => getFilteredNPTEvents(events, filterDataNpt),
      [events, filterDataNpt]
    );

    return <NptWellsTable events={filteredEvents} />;
  }
);
