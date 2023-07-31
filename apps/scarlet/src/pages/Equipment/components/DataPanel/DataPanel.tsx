import { useMemo } from 'react';
import { useAppState, useDataPanelState } from 'hooks';
import { DataElementOrigin, DataElement } from 'types';

import { Card, ComponentPanel, EquipmentPanel } from '..';

import * as Styled from './style';

export const DataPanel = () => {
  const { currentOrigin, visibleDataElement } = useDataPanelState();
  const appState = useAppState();
  const dataElement = useMemo(() => {
    let dataElements: DataElement[] = [];

    if (visibleDataElement?.origin === DataElementOrigin.COMPONENT) {
      const component = appState.equipment.data?.components.find(
        (component) => component.id === visibleDataElement?.componentId
      );
      dataElements = component?.componentElements || [];
    } else {
      dataElements = appState.equipment.data?.equipmentElements || [];
    }
    return dataElements.find((item) => item.id === visibleDataElement?.id);
  }, [visibleDataElement, appState.equipment.data]);

  return (
    <Styled.Container>
      <Styled.ListWrapper inactive={!!dataElement}>
        <Styled.List>
          {currentOrigin === DataElementOrigin.EQUIPMENT && <EquipmentPanel />}
          {currentOrigin === DataElementOrigin.COMPONENT && <ComponentPanel />}
        </Styled.List>
      </Styled.ListWrapper>
      {dataElement && (
        <Styled.Item>
          <Card dataElement={dataElement} key={dataElement.id} />
        </Styled.Item>
      )}
    </Styled.Container>
  );
};
