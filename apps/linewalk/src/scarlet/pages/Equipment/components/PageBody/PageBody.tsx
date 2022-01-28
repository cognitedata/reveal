import { CollapsablePanel } from '@cognite/cogs.js';
import { useDataPanelState, useAppState } from 'scarlet/hooks';

import { DataElementModals, DataPanel, DataPanelControllers, Ornate } from '..';

import * as Styled from './style';

export const PageBody = () => {
  const dataPanelState = useDataPanelState();
  const { documents } = useAppState();

  return (
    <Styled.Container>
      <CollapsablePanel
        sidePanelRight={<DataPanel />}
        sidePanelRightVisible={dataPanelState.isVisible}
        sidePanelRightWidth={450}
      >
        <Ornate documents={documents?.data} fullwidth />
        <DataPanelControllers />
      </CollapsablePanel>

      <DataElementModals />
    </Styled.Container>
  );
};
