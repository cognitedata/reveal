import { CollapsablePanel } from '@cognite/cogs.js';
import { useDataPanelState, useAppState } from 'scarlet/hooks';

import {
  DataElementModals,
  DataPanel,
  DataPanelControllers,
  Ornate,
  TopBar,
} from '..';
import { SelectedElementsBar } from '../SelectedElementsBar';

import * as Styled from './style';

export const SIDE_PANEL_RIGHT_WIDTH = 450;

type PageBodyProps = {
  unitName: string;
  equipmentName: string;
};

export const PageBody = ({ unitName, equipmentName }: PageBodyProps) => {
  const dataPanelState = useDataPanelState();
  const { documents } = useAppState();

  return (
    <Styled.Container>
      <CollapsablePanel
        sidePanelRight={<DataPanel />}
        sidePanelRightVisible={dataPanelState.isVisible}
        sidePanelRightWidth={SIDE_PANEL_RIGHT_WIDTH}
      >
        <Styled.MainContainer>
          <TopBar unitName={unitName} equipmentName={equipmentName} />
          <Styled.OrnateContainer>
            <Ornate documents={documents?.data} fullwidth />
            <DataPanelControllers />
          </Styled.OrnateContainer>
        </Styled.MainContainer>
        <Styled.BottomContainer>
          {Boolean(dataPanelState.checkedDataElements.length) && (
            <SelectedElementsBar
              dataElements={dataPanelState.checkedDataElements}
            />
          )}
        </Styled.BottomContainer>
      </CollapsablePanel>

      <DataElementModals />
    </Styled.Container>
  );
};
