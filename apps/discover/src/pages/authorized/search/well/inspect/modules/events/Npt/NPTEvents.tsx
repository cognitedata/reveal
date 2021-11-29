import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

import { WhiteLoader } from 'components/loading';
import { NoUnmountShowHide } from 'components/no-unmount-show-hide';
import { clearNPTGraphSelectedWellboreData } from 'modules/wellInspect/actions';
import {
  useNptEventsForGraph,
  useNptEventsForTable,
} from 'modules/wellSearch/selectors';

import { Separator } from '../../../elements';
import { GraphTableSwitch } from '../../common/GraphTableSwitch';

import { VIEW_MODES, DEFAULT_ACTIVE_VIEW_MODE } from './constants';
import { NPTEventsDataControlArea } from './elements';
import { FilterContainer } from './filters';
import { NPTGraph, SelectedWellboreView } from './graph';
import { NPTTable } from './table';

export const NPTEvents: React.FC = () => {
  const dispatch = useDispatch();

  const { isLoading: isLoadingGraph, events: eventsGraph } =
    useNptEventsForGraph();
  const { isLoading: isLoadingTable, events: eventsTable } =
    useNptEventsForTable();

  useEffect(() => {
    dispatch(clearNPTGraphSelectedWellboreData());
  }, []);

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
        <GraphTableSwitch
          viewMode={activeViewMode}
          onChange={setActiveViewMode}
        />
        {isTableViewModeActive && <Separator />}
        <FilterContainer
          events={eventsTable}
          isVisible={isTableViewModeActive}
        />
      </NPTEventsDataControlArea>

      <NoUnmountShowHide show={isGraphViewModeActive} fullHeight>
        <NPTGraph events={eventsGraph} />
      </NoUnmountShowHide>

      {isTableViewModeActive && <NPTTable events={eventsTable} />}

      <SelectedWellboreView />
    </>
  );
};

export default NPTEvents;
