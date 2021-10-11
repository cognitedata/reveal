import React, { useMemo, useState } from 'react';

import { WhiteLoader } from 'components/loading';
import { NoUnmountShowHide } from 'components/no-unmount-show-hide';
import {
  useNptEventsForGraph,
  useNptEventsForTable,
} from 'modules/wellSearch/selectors';

import { VIEW_MODES, DEFAULT_ACTIVE_VIEW_MODE } from './constants';
import { NPTEventsDataControlArea } from './elements';
import { FilterContainer } from './filters';
import { NPTGraph } from './graph';
import { SwitchViewMode } from './SwitchViewMode';
import { NPTTable } from './table';

export const NPTEvents: React.FC = () => {
  const { isLoading: isLoadingGraph, events: eventsGraph } =
    useNptEventsForGraph();
  const { isLoading: isLoadingTable, events: eventsTable } =
    useNptEventsForTable();

  const [activeViewMode, setActiveViewMode] = useState<string>(
    DEFAULT_ACTIVE_VIEW_MODE
  );

  const { Graph, Table } = VIEW_MODES;

  const isGraphViewModeActive = useMemo(
    () => activeViewMode === Graph,
    [activeViewMode]
  );

  const isTableViewModeActive = useMemo(
    () => activeViewMode === Table,
    [activeViewMode]
  );

  if (isLoadingGraph || isLoadingTable) {
    return <WhiteLoader />;
  }

  return (
    <>
      <NPTEventsDataControlArea>
        <SwitchViewMode
          activeViewMode={activeViewMode}
          onChangeViewMode={setActiveViewMode}
        />
        <FilterContainer
          events={eventsTable}
          isVisible={isTableViewModeActive}
        />
      </NPTEventsDataControlArea>

      <NoUnmountShowHide show={isGraphViewModeActive}>
        <NPTGraph events={eventsGraph} />
      </NoUnmountShowHide>

      {isTableViewModeActive && <NPTTable events={eventsTable} />}
    </>
  );
};

export default NPTEvents;
