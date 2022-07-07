import React, { useCallback, useState } from 'react';

import { Loading, WhiteLoaderOverlay } from 'components/Loading';
import { MultiStateToggle } from 'components/MultiStateToggle';
import { NoUnmountShowHide } from 'components/NoUnmountShowHide';
import { ViewModes } from 'pages/authorized/search/common/types';

import { Separator } from '../../elements';

import { DEFAULT_ACTIVE_VIEW_MODE } from './constants';
import { NptEventsDataControlArea } from './elements';
import { FilterContainer } from './filters';
import { NptGraph, SelectedWellboreNptView } from './Graph';
import { useNptData } from './hooks/useNptData';
import { NptTable } from './Table';

export const NPTEvents: React.FC = () => {
  const { isLoading, data, nptCodeDefinitions, nptDetailCodeDefinitions } =
    useNptData();

  const [activeViewMode, setActiveViewMode] = useState<ViewModes>(
    DEFAULT_ACTIVE_VIEW_MODE
  );

  const [nptGraphSelectedWellbore, setNptGraphSelectedWellbore] = useState<
    string | undefined
  >();
  const [selectedWellboreViewLoading, setSelectedWellboreViewLoading] =
    useState<boolean>(false);

  const isGraphViewModeActive = activeViewMode === ViewModes.Graph;
  const isTableViewModeActive = activeViewMode === ViewModes.Table;

  const handleSelectNptGraphBar = useCallback((selectedWellbore?: string) => {
    setSelectedWellboreViewLoading(true);
    setTimeout(() => {
      setNptGraphSelectedWellbore(selectedWellbore);
      setTimeout(() => setSelectedWellboreViewLoading(false));
    });
  }, []);

  const handleCloseWellboreDetailView = () => {
    setNptGraphSelectedWellbore(undefined);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <NptEventsDataControlArea>
        <MultiStateToggle<ViewModes>
          activeOption={activeViewMode}
          options={ViewModes}
          onChange={setActiveViewMode}
        />

        {isTableViewModeActive && <Separator />}

        <FilterContainer
          data={data}
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
        selectedWellboreId={nptGraphSelectedWellbore}
        onCloseSelectedWellboreNptViewClick={handleCloseWellboreDetailView}
      />

      {selectedWellboreViewLoading && <WhiteLoaderOverlay />}
    </>
  );
};

export default NPTEvents;
