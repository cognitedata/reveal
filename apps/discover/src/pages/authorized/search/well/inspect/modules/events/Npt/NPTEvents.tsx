import React, { useCallback, useState } from 'react';

import { Loading, WhiteLoaderOverlay } from 'components/loading';
import { MultiStateToggle } from 'components/multiStateToggle';
import { NoUnmountShowHide } from 'components/no-unmount-show-hide';
import { useNptEvents } from 'modules/wellSearch/selectors';

import { Separator } from '../../../elements';

import { VIEW_MODES, DEFAULT_ACTIVE_VIEW_MODE } from './constants';
import { NptEventsDataControlArea } from './elements';
import { FilterContainer } from './filters';
import { NPTGraph, SelectedWellboreNptView } from './graph';
import { SelectedWellbore } from './graph/types';
import { NPTTable } from './table';
import { ViewModes } from './types';

export const NPTEvents: React.FC = () => {
  const { isLoading, events } = useNptEvents();

  const [activeViewMode, setActiveViewMode] = useState<ViewModes>(
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
        <MultiStateToggle<ViewModes>
          activeOption={activeViewMode}
          options={VIEW_MODES}
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

      <SelectedWellboreNptView
        events={events}
        selectedWellbore={nptGraphSelectedWellbore}
        setSelectedWellbore={setNptGraphSelectedWellbore}
      />

      {selectedWellboreViewLoading && <WhiteLoaderOverlay />}
    </>
  );
};

export default NPTEvents;
