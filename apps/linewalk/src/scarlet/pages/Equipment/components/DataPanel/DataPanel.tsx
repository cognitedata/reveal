import { useMemo } from 'react';
import { useAppState, useDataPanelState } from 'scarlet/hooks';
import { DataElementOrigin } from 'scarlet/types';

import { Card, EquipmentPanel } from '..';

import * as Styled from './style';

export const DataPanel = () => {
  const { currentOrigin, visibleDataElement } = useDataPanelState();
  const appState = useAppState();
  const dataElement = useMemo(
    () =>
      appState.equipment.data?.equipmentElements.find(
        (item) => item.key === visibleDataElement?.key
      ),
    [visibleDataElement, appState.equipment.data]
  );

  return (
    <Styled.Container>
      {currentOrigin === DataElementOrigin.EQUIPMENT && (
        <Styled.ListWrapper inactive={!!dataElement}>
          <Styled.List>
            <EquipmentPanel />
          </Styled.List>
        </Styled.ListWrapper>
      )}
      {dataElement && (
        <Styled.Item>
          <Card dataElement={dataElement} />
        </Styled.Item>
      )}
    </Styled.Container>
  );
};
