import { useMemo } from 'react';
import { CollapsablePanel } from '@cognite/cogs.js';
import { useDataPanelState, useStorageState } from 'scarlet/hooks';

import { DataPanel, DataPanelControllers, Ornate } from '..';

import * as Styled from './style';

export const PageBody = () => {
  const dataPanelState = useDataPanelState();
  const { documents, equipment } = useStorageState();

  const dataElements = useMemo(
    () =>
      equipment.data?.equipmentElements.filter(
        (item) => item.scannerDetections?.length
      ),
    [equipment]
  );

  return (
    <Styled.Container>
      <CollapsablePanel
        sidePanelRight={<DataPanel />}
        sidePanelRightVisible={dataPanelState.isVisible}
        sidePanelRightWidth={450}
      >
        <Ornate
          documents={documents?.data}
          dataElements={dataElements}
          fullwidth
        />
        <DataPanelControllers />
      </CollapsablePanel>
    </Styled.Container>
  );
};
