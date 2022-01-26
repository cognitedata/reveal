import { useMemo } from 'react';
import { CollapsablePanel } from '@cognite/cogs.js';
import { useDataPanelState, useAppState } from 'scarlet/hooks';
import { DataElementState } from 'scarlet/types';

import { DataElementModals, DataPanel, DataPanelControllers, Ornate } from '..';

import * as Styled from './style';

export const PageBody = () => {
  const dataPanelState = useDataPanelState();
  const { documents, equipment } = useAppState();

  const dataElements = useMemo(
    () =>
      equipment.data?.equipmentElements.filter(
        (item) =>
          item.state !== DataElementState.OMITTED && item.detections?.length
      ),
    [equipment.data]
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

      <DataElementModals />
    </Styled.Container>
  );
};
