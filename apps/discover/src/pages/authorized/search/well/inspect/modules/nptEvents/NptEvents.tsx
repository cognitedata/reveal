import React, { useCallback, useState } from 'react';

import { Loading, WhiteLoaderOverlay } from 'components/Loading';
import { MultiStateToggle } from 'components/MultiStateToggle';
import { NoUnmountShowHide } from 'components/NoUnmountShowHide';
import { useNptEvents } from 'modules/wellSearch/selectors';

import { Separator } from '../../elements';

import { VIEW_MODES, DEFAULT_ACTIVE_VIEW_MODE } from './constants';
import { NptEventsDataControlArea } from './elements';
import { FilterContainer } from './filters';
import { NptGraph, SelectedWellboreNptView } from './Graph';
import { SelectedWellbore } from './Graph/types';
import { useNptData } from './hooks/useNptData';
import { NptTable } from './Table';
import { ViewModes } from './types';

export const NPTEvents: React.FC = () => {
  const { events } = useNptEvents();
  const { isLoading, data, nptCodeDefinitions, nptDetailCodeDefinitions } =
    useNptData();

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

        <FilterContainer
          events={events}
          isVisible={isTableViewModeActive}
          nptCodeDefinitions={nptCodeDefinitions}
          nptDetailCodeDefinitions={nptDetailCodeDefinitions}
        />
      </NptEventsDataControlArea>

      <NoUnmountShowHide show={isGraphViewModeActive} fullHeight>
        <NptGraph data={data} onSelectBar={handleSelectNptGraphBar} />
      </NoUnmountShowHide>

      <NoUnmountShowHide show={isTableViewModeActive} fullHeight>
        <NptTable data={data} />
      </NoUnmountShowHide>

      <SelectedWellboreNptView
        data={data}
        selectedWellbore={nptGraphSelectedWellbore}
        setSelectedWellbore={setNptGraphSelectedWellbore}
      />

      {selectedWellboreViewLoading && <WhiteLoaderOverlay />}
    </>
  );
};

export default NPTEvents;
