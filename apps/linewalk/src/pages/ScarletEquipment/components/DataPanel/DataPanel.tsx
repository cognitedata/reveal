import { useDataPanelState } from '../../hooks';
import { DataElementOrigin } from '../../types';
import { EquipmentPanel } from '..';

import * as Styled from './style';

export const DataPanel = () => {
  const dataPanelState = useDataPanelState();

  return (
    <Styled.Container>
      {dataPanelState.currentOrigin === DataElementOrigin.EQUIPMENT && (
        <EquipmentPanel />
      )}
    </Styled.Container>
  );
};
