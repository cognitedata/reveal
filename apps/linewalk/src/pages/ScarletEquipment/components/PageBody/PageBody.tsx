import { CollapsablePanel } from '@cognite/cogs.js';

import { useDataPanelState, useStorageState } from '../../hooks';
import { DataPanel, DataPanelControllers, Ornate } from '..';

import * as Styled from './style';

export const ScarletBody = () => {
  const dataPanelState = useDataPanelState();
  const { documents } = useStorageState();

  return (
    <Styled.Container>
      <CollapsablePanel
        sidePanelRight={<DataPanel />}
        sidePanelRightVisible={dataPanelState.isVisible}
        sidePanelRightWidth={337}
      >
        <Ornate documents={documents?.data} />
        <DataPanelControllers />
      </CollapsablePanel>
    </Styled.Container>
  );
};
