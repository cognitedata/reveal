import React from 'react';

import { useDeepMemo } from 'hooks/useDeep';
import { useFilterDataNpt } from 'modules/filterData/selectors';
import { NPTEvent } from 'modules/wellSearch/types';
import { getFilteredNPTEvents } from 'modules/wellSearch/utils/events';

import { NptWellsTable } from './NptWellsTable';

export const NPTTable: React.FC<{ events: NPTEvent[] }> = React.memo(
  ({ events }) => {
    const filterDataNpt = useFilterDataNpt();

    const filteredEvents = useDeepMemo(
      () => getFilteredNPTEvents(events, filterDataNpt),
      [events, filterDataNpt]
    );

    return <NptWellsTable events={filteredEvents} />;
  }
);
