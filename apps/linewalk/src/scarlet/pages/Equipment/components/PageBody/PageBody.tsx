import { CollapsablePanel } from '@cognite/cogs.js';
import { useDataPanelState, useAppState } from 'scarlet/hooks';

import { DataElementModals, DataPanel, DataPanelControllers, Ornate } from '..';

import * as Styled from './style';

export const SIDE_PANEL_RIGHT_WIDTH = 450;

export const PageBody = () => {
  const dataPanelState = useDataPanelState();
  const { documents } = useAppState();

  return (
    <Styled.Container>
      <CollapsablePanel
        sidePanelRight={<DataPanel />}
        sidePanelRightVisible={dataPanelState.isVisible}
        sidePanelRightWidth={SIDE_PANEL_RIGHT_WIDTH}
      >
        <Ornate documents={documents?.data} fullwidth />
        <DataPanelControllers />
      </CollapsablePanel>

      <DataElementModals />
    </Styled.Container>
  );
};
