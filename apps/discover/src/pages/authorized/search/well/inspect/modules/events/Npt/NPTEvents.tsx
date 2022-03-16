import React, { useCallback, useState } from 'react';

import { Loading, WhiteLoaderOverlay } from 'components/loading';
import { NoUnmountShowHide } from 'components/no-unmount-show-hide';
import { useNptEvents } from 'modules/wellSearch/selectors';

import { Separator } from '../../../elements';
import { GraphTableSwitch } from '../../common/GraphTableSwitch';

import { VIEW_MODES, DEFAULT_ACTIVE_VIEW_MODE } from './constants';
import { NptEventsDataControlArea } from './elements';
import { FilterContainer } from './filters';
import { NPTGraph, SelectedWellboreView } from './graph';
import { SelectedWellbore } from './graph/types';
import { NPTTable } from './table';

export const NPTEvents: React.FC = () => {
  const { isLoading, events } = useNptEvents();

  const [activeViewMode, setActiveViewMode] = useState<string>(
    DEFAULT_ACTIVE_VIEW_MODE
  );
  const [nptGraphSelectedWellbore, setNptGraphSelectedWellbore] =
    useState<SelectedWellbore>();
  const [selectedWellboreViewLoading, setSelectedWellboreViewLoading] =
    useState<boolean>(false);

  const isGraphViewModeActive = activeViewMode === VIEW_MODES.Graph;
  const isTableViewModeActive = activeViewMode === VIEW_MODES.Table;

  const handleSelectNptGraphBar = useCallback(
    (selectedWellbore: SelectedWellbore) => {
      setSelectedWellboreViewLoading(true);
      setTimeout(() => {
        setNptGraphSelectedWellbore(selectedWellbore);
        setTimeout(() => setSelectedWellboreViewLoading(false));
      });
    },
    []
  );

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <NptEventsDataControlArea>
        <GraphTableSwitch
          viewMode={activeViewMode}
          onChange={setActiveViewMode}
        />
        {isTableViewModeActive && <Separator />}
        <FilterContainer events={events} isVisible={isTableViewModeActive} />
      </NptEventsDataControlArea>

      <NoUnmountShowHide show={isGraphViewModeActive} fullHeight>
        <NPTGraph events={events} onSelectBar={handleSelectNptGraphBar} />
      </NoUnmountShowHide>

      <NoUnmountShowHide show={isTableViewModeActive} fullHeight>
        <NPTTable events={events} />
      </NoUnmountShowHide>

      <SelectedWellboreView
        events={events}
        selectedWellbore={nptGraphSelectedWellbore}
        setSelectedWellbore={setNptGraphSelectedWellbore}
      />

      {selectedWellboreViewLoading && <WhiteLoaderOverlay />}
    </>
  );
};

export default NPTEvents;
